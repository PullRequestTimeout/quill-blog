import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	deleteUser,
	EmailAuthProvider,
	reauthenticateWithCredential,
	updatePassword,
	sendPasswordResetEmail,
	sendEmailVerification
} from "firebase/auth";
import { auth } from "$lib/firebase/firebase.js";
import { handleAlertMessage } from "$lib/stores/uiStore.svelte.js";

export const authHandlers = {
	signup: async (email: string, password: string, fname: string) => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			if (auth.currentUser) {
				await updateProfile(auth.currentUser, { displayName: fname });
				handleAlertMessage("New account created successfully!");
			} else {
				handleAlertMessage("No user found.");
				throw new Error("No authenticated user found.");
			}
		} catch (err: any) {
			let errorReason = err.toString();
			if (errorReason.includes("auth/email-already-in-use")) {
				handleAlertMessage("This email is already in use.");
			} else if (errorReason.includes("auth/invalid-email")) {
				handleAlertMessage("This doesn't seem to be a valid email.");
			} else if (errorReason.includes("auth/weak-password")) {
				handleAlertMessage("Your password is too weak.");
			} else {
				handleAlertMessage("Oops. Something went wrong.");
				console.error(err);
			}
		}
	},

	login: async (email: string, password: string) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			handleAlertMessage("Login successful!");
		} catch (err: any) {
			let errorReason = err.toString();
			if (errorReason.includes("auth/user-not-found")) {
				handleAlertMessage("There doesn't seem to be an account associated with this email.");
			} else if (errorReason.includes("auth/invalid-email")) {
				handleAlertMessage("This doesn't seem to be a valid email.");
			} else if (errorReason.includes("auth/wrong-password")) {
				handleAlertMessage("Your password is incorrect.");
			} else {
				handleAlertMessage("Oops. Something went wrong.");
				console.error(err);
			}
		}
	},

	logout: () => {
		signOut(auth)
			.then(() => {
				handleAlertMessage("Successfully logged out.");
			})
			.catch((error) => {
				console.error(error);
				handleAlertMessage("There was an error logging out. Try again.");
			});
	},

	resetPassword: async (email: string) => {
		try {
			await sendPasswordResetEmail(auth, email);
			handleAlertMessage("Password reset email sent. Make sure to check your spam folder.", 5);
		} catch (err: any) {
			console.error(err);
			handleAlertMessage("There was an error sending the password reset email.");
		}
	},

	resendEmailVerification: () => {
		const user = auth.currentUser;
		if (user) {
			sendEmailVerification(user)
				.then(() => {
					signOut(auth).then(() => {
						handleAlertMessage("Please verify email to continue.", 10);
					});
				})
				.catch((error) => {
					console.error(error);
					handleAlertMessage("There was a problem sending the email verification. Try again soon.");
				});
		} else {
			handleAlertMessage("No authenticated user found.");
		}
	},

	updatePassword: (currPass: string, newPass: string) => {
		const user = auth.currentUser;
		if (user && user.email) {
			const credential = EmailAuthProvider.credential(user.email, currPass);
			reauthenticateWithCredential(user, credential)
				.then(() => {
					updatePassword(user, newPass)
						.then(() => {
							handleAlertMessage("Password updated!");
						})
						.catch((error) => {
							console.error(error);
							handleAlertMessage("There was an error updating your password.");
						});
				})
				.catch((error) => {
					handleAlertMessage("There was an error reauthenticating your account.");
					console.error(error);
				});
		} else {
			handleAlertMessage("No authenticated user found.");
		}
	}
};

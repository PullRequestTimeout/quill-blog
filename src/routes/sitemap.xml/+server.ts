import { databaseHandlers } from "$lib/firebase/db";

export async function GET() {
	const SITE_URL = import.meta.env.VITE_SITE_URL;

	const blogPosts = await databaseHandlers.getAllBlogPosts();
	const publishedBlogPosts = blogPosts.filter((post: any) => post.postState === "published");

	const postUrls = publishedBlogPosts.map((post: any) => {
		const slug = post.slug;
		const lastmod = post.date;
		return `
			<url>
				<loc>${SITE_URL}/blog/${slug}</loc>
				<lastmod>${lastmod}</lastmod>
			</url>`;
	});

	const xml = `
	<?xml version="1.0" encoding="UTF-8" ?>
	<urlset
		xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
		xmlns:xhtml="https://www.w3.org/1999/xhtml"
		xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
		xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
		xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
		xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
	>
		<url>
			<loc>${SITE_URL}</loc>
			<priority>1.0</priority>
		</url>
        <url>
            <loc>${SITE_URL}/services</loc>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>${SITE_URL}/about</loc>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>${SITE_URL}/contact</loc>
            <priority>0.8</priority>
        </url>
		<url>
			<loc>${SITE_URL}/blog</loc>
			<priority>0.8</priority>
		</url>
		${postUrls.join("\n")}
	</urlset>`.trim();

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml"
		}
	});
}

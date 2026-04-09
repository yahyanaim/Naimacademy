import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ArticlesSearch from "@/components/blog/articles-search";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-14">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Articles
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Insights, tutorials, and stories to help you learn and grow
            </p>
          </div>

          <ArticlesSearch />
        </div>
      </main>
      <Footer />
    </>
  );
}

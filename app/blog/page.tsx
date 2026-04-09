import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ArticlesSearch from "@/components/blog/articles-search";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-14">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Articles
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
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

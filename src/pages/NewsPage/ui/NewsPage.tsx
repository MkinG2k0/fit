import { NewsFeed } from "@/features/news";

export const NewsPage = () => {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2.5 pb-4 sm:gap-4 sm:px-3">
      <p className="text-sm text-muted-foreground">Что нового в приложении</p>
      <NewsFeed />
    </div>
  );
};

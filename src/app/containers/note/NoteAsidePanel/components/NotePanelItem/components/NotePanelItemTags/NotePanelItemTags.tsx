import type { NotePanelItemTagsProps } from "./NotePanelItemTags.type";

const MAX_VISIBLE_TAGS = 3;

const NotePanelItemTags = ({ tags }: NotePanelItemTagsProps) => {
  if (tags.length === 0) return null;

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <div className="flex flex-wrap gap-[0.4rem]">
      {visibleTags.map(tag => (
        <span
          key={tag}
          className="text-[1.2rem] text-[var(--color-text-secondary)]">
          #{tag}
        </span>
      ))}

      {remainingCount > 0 && (
        <span className="text-[1.2rem] text-[var(--color-text-help)]">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default NotePanelItemTags;

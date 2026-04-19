import {
  ACTION_STATUS_LABEL,
  ACTION_TYPE_LABEL,
  SOURCE_TYPE_LABEL,
} from "./NoteInfoPanelSource.constants";
import type { NoteInfoPanelSourceProps } from "./NoteInfoPanelSource.type";

const NoteInfoPanelSource = ({ noteDetail, actions }: NoteInfoPanelSourceProps) => {
  return (
    <section className="flex flex-col gap-[1.2rem] border-b border-[var(--color-divider-lighter)] px-[2rem] py-[1.6rem]">
      <div className="flex flex-col gap-[0.4rem] text-[1.2rem] text-[var(--color-text-secondary)]">
        <span>
          소스: {SOURCE_TYPE_LABEL[noteDetail?.source_type ?? ""] ?? noteDetail?.source_type}
        </span>
        {noteDetail?.source_url && (
          <a
            href={noteDetail.source_url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-[var(--color-primary)] hover:underline"
          >
            {noteDetail.source_url}
          </a>
        )}
        <span>
          생성:{" "}
          {noteDetail?.created_at ? new Date(noteDetail.created_at).toLocaleDateString() : "-"}
        </span>
        <span>
          수정:{" "}
          {noteDetail?.updated_at ? new Date(noteDetail.updated_at).toLocaleDateString() : "-"}
        </span>
      </div>

      <div className="flex flex-col gap-[0.8rem]">
        <h4 className="text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">
          추출된 액션 ({actions.length})
        </h4>

        {actions.length === 0 ? (
          <p className="text-[1.2rem] text-[var(--color-text-help)]">추출된 액션이 없습니다</p>
        ) : (
          <ul className="flex flex-col gap-[0.8rem]">
            {actions.map(action => (
              <li
                key={action.id}
                className="flex flex-col gap-[0.2rem] rounded-[0.8rem] bg-[var(--color-gray-bg)] px-[1.2rem] py-[0.8rem]"
              >
                <div className="flex items-center gap-[0.6rem]">
                  <span
                    className={`rounded-[0.4rem] px-[0.6rem] py-[0.1rem] text-[1.1rem] font-semibold ${
                      action.type === "event"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {ACTION_TYPE_LABEL[action.type]}
                  </span>
                  <span className="text-[1.1rem] text-[var(--color-text-help)]">
                    {ACTION_STATUS_LABEL[action.status]}
                  </span>
                </div>

                <p
                  className={`text-[1.3rem] text-[var(--color-text-primary)] ${
                    action.status === "completed" ? "line-through" : ""
                  }`}
                >
                  {action.summary}
                </p>

                {action.status === "pending" && action.end_time && (
                  <span className="text-[1.1rem] text-[var(--color-text-help)]">
                    기한: {new Date(action.end_time).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default NoteInfoPanelSource;

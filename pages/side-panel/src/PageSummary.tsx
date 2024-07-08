import PageMetadata from './PageMetadata';
import { SummarizationResponse } from './Summarize';

/* eslint-disable react/prop-types */
export default function PageSummary({
  loading,
  summary,
  taskType,
  onClickDelete,
}: {
  loading: boolean;
  summary: SummarizationResponse | null;
  taskType: string;
  onClickDelete: () => void;
}) {
  console.log('PageSummary: ', loading, summary, taskType);
  return (
    <div>
      {loading ? (
        <div className="text-lg flex items-center">
          <div className="duo-chat-loader flex items-center mr-2">
            <div className="loader dot--1"></div>
            <div className="loader dot--2"></div>
            <div className="loader dot--3"></div>
          </div>
          <p className="">Generating summary...</p>
        </div>
      ) : summary ? (
        <div>
          <div className="content-box">
            <h2 className="text-lg">{summary.title}</h2>
            <div className="summary-body border rounded-md p-2 bg-white border-gray-800">{summary.text}</div>
          </div>
          <div className="form-container">
            <PageMetadata metadata={summary} taskType={taskType} />
          </div>
          <button
            className="btn-delete focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            onClick={onClickDelete}>
            결과 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}

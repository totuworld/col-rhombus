import { VscBrowser } from 'react-icons/vsc';
import PropTypes from 'prop-types';

function switchToTab(tabId, pageURL) {
  // check if running on Chrome
  if (typeof chrome === 'undefined') {
    return;
  }
  chrome.tabs.update(tabId, { active: true }, function () {
    // You can handle errors here if the tab ID is invalid or the tab is closed
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      // open a new tab with the url
      chrome.tabs.create({ url: pageURL });
    }
  });
}
// eslint-disable-next-line react/prop-types
export default function PageMetadata({ metadata, taskType }) {
  return metadata ? (
    <div className="page-metadata mt-4">
      <div className="flex flex-col">
        {metadata.tabID && (
          <button
            onClick={() => switchToTab(metadata.tabID, metadata.pageURL)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                switchToTab(metadata.tabID, metadata.pageURL);
              }
            }}
            tabIndex={0}
            className="icon-wrapper inline-flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-full text-xs px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 flex-grow-0 justify-center"
            title="Switch to tab">
            <VscBrowser size="1.2em" className="me-2" /> 해당 탭 열기
          </button>
        )}
        {/* Display task type specific text */}
        {taskType === 'summary' && <span className="task-type-text">Summarized: </span>}
        {taskType === 'qanda' && <span className="task-type-text">Chatting with: </span>}
        {/* Display the page URL or file name */}
        {metadata.pageURL ? (
          <a href={metadata.pageURL} target="_blank" rel="noopener noreferrer">
            {metadata.pageURL}
          </a>
        ) : metadata.fileName ? (
          <span className="task-type-text">Chatting with: {metadata.fileName}</span>
        ) : null}
      </div>
    </div>
  ) : null;
}

PageMetadata.propTypes = {
  taskType: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    text: PropTypes.string, // can be optional
    pageURL: PropTypes.string, // can be optional
    fileName: PropTypes.string, // can be optional
    tabID: PropTypes.number, // can be optional
  }),
};

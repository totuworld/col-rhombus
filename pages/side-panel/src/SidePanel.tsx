import '@src/SidePanel.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import { useEffect, useState } from 'react';
import Settings from './Settings';
import { getModels, Model } from '../../utils/processing';
import Instructions from './Instruction';
import { SummarizationResponse, summarizeCurrentPage } from './Summarize';
import PageSummary from './PageSummary';

const SidePanel = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummarizationResponse | null>(null);
  const [selectedParams, setSelectedParams] = useState<{ model: Model; temperature: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'qanda' | 'summary' | null>(null);
  const [serverRunning, setServerRunning] = useState(false);

  const toggleSettingsVisibility = () => {
    chrome.storage.local.set({ isDefaultSet: false });
    setShowSettings(prev => !prev);
  };

  const fetchModels = async () => {
    try {
      const fetchedModels = await getModels();
      console.log('fetchedModels', fetchedModels);
      if (!selectedParams) {
        setSelectedParams({ model: fetchedModels[0], temperature: 0.3 });
        setServerRunning(true);
      }
    } catch (error) {
      console.log(error);
      setServerRunning(false);
    }
  };

  const handleSummarizeAction = async () => {
    console.log('Model used for summary: ', selectedParams);
    if (!selectedParams) return;
    setLoading(true);
    const response = await summarizeCurrentPage(selectedParams);
    setSummary(response ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchModels();
    setSummary(null);
  }, []);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#eee' : '#222',
      }}>
      <header className="flex justify-between">
        {(showSettings || selectedOption !== null) && (
          <button
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={() => {
              setSelectedOption(null);
              setShowSettings(false);
            }}>
            뒤로가기
          </button>
        )}

        {showSettings === false && selectedOption === null && (
          <button
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={toggleSettingsVisibility}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
            </svg>
          </button>
        )}
      </header>
      {showSettings && (
        <Settings
          onParamChange={value => {
            setSelectedParams(value);
          }}
          onClickSave={() => {
            setShowSettings(false);
          }}
        />
      )}
      {selectedOption === null && (
        <div className="App-content">
          {!serverRunning ? (
            <Instructions />
          ) : (
            <>
              <p className="text-lg mb-4">어떤 작업을 진행할까요?</p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  type="button"
                  onClick={() => setSelectedOption('qanda')}
                  title="Chat with LLM">
                  현재 페이지 정보를 토대로 채팅하기
                </button>
                <button
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  type="button"
                  onClick={() => setSelectedOption('summary')}
                  title="Summarize Current Page">
                  현재 페이지 요약하기
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {selectedOption === 'summary' && (
        <div>
          {!loading && !summary && (
            <div className="App-content">
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={handleSummarizeAction}>
                요약 실행
              </button>
              {/* 원하는 탭이 동작하기 위해서는 content script가 동작해야한다 */}
              {/* 이게 안될 수 있으니, side panel이 열린 상태로 원하는 탭으로 이동한 뒤 */}
              {/* 해당 페이지를 리로드하라는 안내를 추가한다 */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  페이지 요약을 실패한다면, 원하는 탭으로 이동한 뒤 페이지를 새로고침해주세요.
                </p>
              </div>
            </div>
          )}
          <PageSummary
            loading={loading}
            summary={summary}
            taskType={selectedOption}
            onClickDelete={() => {
              setSummary(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);

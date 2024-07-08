import { useEffect, useState } from 'react';
import { getModels, Model } from '../../utils/processing';

const DEFAULT_TEMPERATURE = 0.3;
// Define a default model if necessary, or use null/undefined
const DEFAULT_MODEL = null;

// Helper function to convert bytes to GB
const bytesToGB = (bytes: number) => (bytes / 1e9).toFixed(2);

const ISO8601StringToDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

/* eslint-disable react/prop-types */
const Settings = ({
  onParamChange,
  onClickSave,
}: {
  onParamChange: (data: { model: Model; temperature: number }) => void;
  onClickSave?: () => void;
}) => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<null | Model>(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [temperatureValue, setTemperatureValue] = useState(DEFAULT_TEMPERATURE);
  const [isDefaultSet, setIsDefaultSet] = useState(false);

  const saveAsDefault = () => {
    if (selectedModel === null) return;
    onParamChange({ model: selectedModel, temperature: temperatureValue });

    // Save as default in Chrome storage
    chrome.storage.local.set({
      defaultModel: selectedModel.name,
      defaultTemperature: temperatureValue,
      isDefaultSet: true, // Flag to indicate default settings are saved
    });
    setIsDefaultSet(true);
    onClickSave && onClickSave();
  };

  // Fetch models and set from storage or defaults
  useEffect(() => {
    let isMounted = true; // To handle component unmount

    const fetchAndSetModels = async () => {
      try {
        setIsLoading(true);
        const fetchedModels = await getModels();
        if (isMounted) {
          setModels(fetchedModels);
          chrome.storage.local.get(['model', 'temperature', 'isDefaultSet'], result => {
            if (result.isDefaultSet) {
              setIsDefaultSet(true);
            }
            if (result.model) {
              const storedModel = fetchedModels.find(m => m.name === result.model.name);
              setSelectedModel(storedModel || fetchedModels[0]);
              setIsDefaultSet(result.isDefaultSet);
            } else {
              setSelectedModel(fetchedModels[0]);
              setIsDefaultSet(false);
            }

            if (result.temperature) {
              setTemperatureValue(result.temperature);
              setIsDefaultSet(result.isDefaultSet);
            } else {
              setTemperatureValue(DEFAULT_TEMPERATURE);
              setIsDefaultSet(false);
            }
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAndSetModels();

    return () => {
      isMounted = false;
    }; // Cleanup function for unmount
  }, []);

  // useEffect(() => {
  //   if (selectedModel && temperatureValue !== null) {
  //     onParamChange({ model: selectedModel, temperature: temperatureValue });
  //     updateStorage(selectedModel, temperatureValue);
  //   }
  // }, [selectedModel, temperatureValue, onParamChange]);

  if (isLoading) {
    return <div>Loading models...</div>;
  }

  if (error) {
    return <div>Error fetching models: {error}</div>;
  }
  if (isDefaultSet) {
    // Render a message or a different UI component
    return (
      <div className="flex items-center bg-blue-500 text-white text-sm px-4 py-3 rounded-md">
        기어 icon을 클릭해서 설정을 변경할 수 있습니다
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="model-container">
        <form className="max-w-sm mx-auto">
          <label htmlFor="model" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            모델 선택
          </label>
          <select
            id="model"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedModel?.name}
            onChange={e => setSelectedModel(models.find(model => model.name === e.target.value)!)}
            disabled={!models.length}>
            {models.map(model => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </form>
        {selectedModel && (
          <div>
            <div className="model-info mb-2">
              <div>사이즈(Size): {bytesToGB(selectedModel.size)} GB</div>
              {/* selectedModel.modified_at 는 ISO */}
              <div>수정: {ISO8601StringToDate(selectedModel.modified_at)}</div>
            </div>
            <div className="slider-container">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Temperature</p>
              <div className="slider-description">
                낮은 값은 더 예측 가능한 응답을 생성하고, <br />
                높은 값은 더 창의적인 응답을 생성합니다.
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperatureValue}
                onChange={e => setTemperatureValue(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-metrics">
                <span className="metric-left">Precise</span>
                <span className="metric-right">Creative</span>
              </div>
              <div className="slider-value-display">{temperatureValue}</div>
            </div>
          </div>
        )}
      </div>
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={saveAsDefault}>
        저장하기
      </button>
    </div>
  );
};

export default Settings;

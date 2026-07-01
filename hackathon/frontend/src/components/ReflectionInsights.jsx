import StatusBadge from './StatusBadge';

function ReflectionInsights({ reflection }) {
  if (!reflection || !reflection.reflection) return null;

  const {
    overallSuccess = false,
    successRate = 0,
    keyInsights = [],
    failures = [],
    improvements = [],
    recommendations = []
  } = reflection.reflection;

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          🧠 Reflection Insights
        </h3>
        <StatusBadge
          status={overallSuccess ? 'success' : 'failed'}
        />
      </div>

      <div className="space-y-5">
        {/* Success Rate */}
        <div className="p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
          <p className="text-sm font-medium text-gray-700">Success Rate</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {typeof successRate === 'number' && successRate > 1 ? successRate.toFixed(1) : (successRate * 100).toFixed(1)}%
          </p>
        </div>

        {/* Key Insights */}
        {keyInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              ✨ Key Insights
            </h4>
            <ul className="space-y-2">
              {keyInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-primary-600 flex-shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Failures Analysis */}
        {failures.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-900 mb-2">
              ⚠️ Failures ({failures.length})
            </h4>
            <ul className="space-y-1">
              {failures.slice(0, 3).map((failure, idx) => (
                <li key={idx} className="text-xs text-red-800">
                  {typeof failure === 'string' ? failure : failure.description || JSON.stringify(failure).substring(0, 100)}
                </li>
              ))}
              {failures.length > 3 && (
                <li className="text-xs text-red-600 italic">
                  ... and {failures.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              📈 Improvements for Next Time
            </h4>
            <ul className="space-y-2">
              {improvements.map((improvement, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700 p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-blue-600 flex-shrink-0">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              💡 Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-yellow-600 flex-shrink-0">★</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReflectionInsights;

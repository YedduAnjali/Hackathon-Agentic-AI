function PlanningPreview({ plan }) {
  if (!plan || !plan.plan) return null;

  const { subGoals = [], tasks = [], timeline = '', successCriteria = [] } = plan.plan;

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        📋 Plan Overview
      </h3>

      <div className="space-y-6">
        {/* Timeline */}
        {timeline && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-2">Timeline</h4>
            <p className="text-slate-700 text-sm">{timeline}</p>
          </div>
        )}

        {/* Sub-Goals */}
        {subGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">
              Sub-Goals ({subGoals.length})
            </h4>
            <div className="space-y-2">
              {subGoals.map((sg, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{sg.title}</p>
                    {sg.description && (
                      <p className="text-xs text-gray-600 mt-1">{sg.description}</p>
                    )}
                  </div>
                  {sg.priority && (
                    <span className="px-2 py-1 text-xs font-medium bg-white rounded border border-blue-200">
                      P{sg.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Preview */}
        {tasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">
              Tasks ({tasks.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.slice(0, 5).map((task, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-600 mt-1 flex-shrink-0">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    {task.tool && (
                      <p className="text-xs text-gray-500 mt-1">🔧 {task.tool}</p>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-xs text-gray-500 p-2">
                  ... and {tasks.length - 5} more tasks
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Criteria */}
        {successCriteria.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">
              Success Criteria
            </h4>
            <ul className="space-y-1">
              {successCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanningPreview;

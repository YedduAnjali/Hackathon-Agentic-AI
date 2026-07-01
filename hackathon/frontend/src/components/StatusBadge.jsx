function StatusBadge({ status, variant = 'default' }) {
  const getStyles = (status, variant) => {
    const styles = {
      active: {
        default: 'bg-blue-100 text-blue-800 border-blue-300',
        outline: 'border-blue-300 text-blue-700'
      },
      completed: {
        default: 'bg-green-100 text-green-800 border-green-300',
        outline: 'border-green-300 text-green-700'
      },
      pending: {
        default: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        outline: 'border-yellow-300 text-yellow-700'
      },
      executing: {
        default: 'bg-purple-100 text-purple-800 border-purple-300',
        outline: 'border-purple-300 text-purple-700'
      },
      failed: {
        default: 'bg-red-100 text-red-800 border-red-300',
        outline: 'border-red-300 text-red-700'
      },
      success: {
        default: 'bg-green-100 text-green-800 border-green-300',
        outline: 'border-green-300 text-green-700'
      }
    };

    return styles[status]?.[variant] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getLabel = (status) => {
    switch (status) {
      case 'active':
        return '🔵 Active';
      case 'completed':
        return '✅ Completed';
      case 'pending':
        return '⏳ Pending';
      case 'executing':
        return '⚙️ Executing';
      case 'failed':
        return '❌ Failed';
      case 'success':
        return '✓ Success';
      default:
        return status;
    }
  };

  const borderClass = variant === 'outline' ? 'border' : '';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${borderClass} ${getStyles(status, variant)}`}>
      {getLabel(status)}
    </span>
  );
}

export default StatusBadge;

/**
 * Export data to CSV and trigger download
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle special cases (dates, nulls, commas in strings)
        if (value === null || value === undefined) return '';
        if (value instanceof Object && value.seconds) {
           return `"${new Date(value.seconds * 1000).toLocaleString()}"`;
        }
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Log admin activity to Firestore
 * @param {Object} db - Firestore instance
 * @param {String} adminEmail - Email of the admin
 * @param {String} action - Description of the action
 * @param {String} targetId - ID of the target entity
 */
export const logAdminAction = async (db, adminEmail, action, targetId = "") => {
  try {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "admin_logs"), {
      adminEmail,
      action,
      targetId,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Error logging admin action", err);
  }
};

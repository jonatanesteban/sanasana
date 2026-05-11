const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('enero.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

const month = 1; // Enero
const year = 2026;

const normalizedData = jsonData.map((row, index) => {
  let dateVal = `${year}-01-${String(row['Día']).padStart(2, '0')}`;
  return {
    id: require('crypto').randomUUID(),
    ...row,
    Fecha: dateVal
  };
});

fs.writeFileSync('src/enero_data.json', JSON.stringify(normalizedData, null, 2));
console.log('Data saved to src/enero_data.json');

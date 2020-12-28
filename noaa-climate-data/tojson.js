const fs = require('fs');

// Simple utility to parse a fixed width file. Given a line,
// it returns a function to "eat" the specified number of characters.
function chomper(line) {
  let current = 0;
  return function eat(count) {
    const chunk = line.slice(current, current + count);
    current += count;
    return chunk;
  }
}

function relativeHumdity() {
  const contents = fs.readFileSync('relhum18.dat.txt', 'utf8');
  const lines = contents.split('\n');
  const dataSetMorning = {
    name: 'Relative Humidity (Morning)',
    dataByCityID: {},
  };
  const dataSetAfternoon = {
    name: 'Relative Humidity (Afternoon)',
    dataByCityID: {},
  };

  // Skip the first two header lines
  for (const line of lines.slice(2)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const id = eat(5);
    const [city, state] = eat(32).split(',');
    const [fromDate, toDate] = eat(13).split('-');
    const common = {
      id,
      city,
      state: state.trim(),
    };
    dataSetMorning.dataByCityID[id] = {
      ...common,
      valueByMonth: [],
    };
    dataSetAfternoon.dataByCityID[id] = {
      ...common,
      valueByMonth: [],
    };
    for (let i = 0; i < 24; i++) {
      if (i % 2 === 0) {
        dataSetMorning.dataByCityID[id].valueByMonth.push(eat(4).trim());
      } else {
        dataSetAfternoon.dataByCityID[id].valueByMonth.push(eat(4).trim());
      }
    }

    dataSetMorning.dataByCityID[id].annualValue = eat(4).trim();
    dataSetAfternoon.dataByCityID[id].annualValue = eat(4).trim();
  }

  return [dataSetMorning, dataSetAfternoon];

}


function normals(input, output, name) {
  const contents = fs.readFileSync(input, 'utf8');
  const lines = contents.split('\n');
  const dataSet = {
    name,
    dataByCityID: {},
  };

  // Skip the first header line
  for (const line of lines.slice(1, 2)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const id = eat(5);
    eat(1); // Comma
    const [city, state] = eat(32).split(',');
    dataSet.dataByCityID[id] = {
      id,
      city,
      state: state.trim(),
      valueByMonth: [],
    };
    const years = eat(4);
    for (let i = 0; i < 12; i++) {
      // Remove comma and space
      dataSet.dataByCityID[id].valueByMonth.push(eat(6).slice(0, -1).trim());
    }

    dataSet.dataByCityID[id].annualValue = eat(6).trim();
  }

  return dataSet;
}

fs.writeFileSync('data.json', JSON.stringify([
  ...relativeHumdity(),
  normals('nrmavg.txt', 'Temperature (Average)'),
  normals('nrmmin.txt', 'Temperature (Min)'),
  normals('nrmmax.txt', 'Temperature (Max)'),
]), 'utf8');

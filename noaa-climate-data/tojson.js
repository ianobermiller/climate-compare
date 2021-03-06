const fs = require('fs');

// Simple utility to parse a fixed width file. Given a line,
// it returns a function to "eat" the specified number of characters.
function chomper(line) {
  let current = 0;
  return function eat(count) {
    const chunk = line.slice(current, current + count);
    current += count;
    return chunk;
  };
}

function titleCase(text) {
  return text.replace(/((^\w)|( \w))/g, s => s.toUpperCase());
}

function cleanCity(city) {
  return titleCase(city.trim().toLowerCase());
}

function relativeHumdity({title, fileName}) {
  const contents = fs.readFileSync(fileName, 'utf8');
  const lines = contents.split('\n');
  const dataSetMorning = {
    name: 'Average Relative Humidity (Morning)',
    dataByCityID: {},
  };
  const dataSetAfternoon = {
    name: 'Average Relative Humidity (Afternoon)',
    dataByCityID: {},
  };

  // Skip the first two header lines
  for (const line of lines.slice(2)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const {id, city, state} = parseIDAndName(eat);

    eat(13).split('-'); // fromDate-toDate
    const common = {id, city, state};
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
        dataSetMorning.dataByCityID[id].valueByMonth.push(
          Number(eat(4).trim()),
        );
      } else {
        dataSetAfternoon.dataByCityID[id].valueByMonth.push(
          Number(eat(4).trim()),
        );
      }
    }

    dataSetMorning.dataByCityID[id].annualValue = eat(4).trim();
    dataSetAfternoon.dataByCityID[id].annualValue = eat(4).trim();
  }

  return [dataSetMorning, dataSetAfternoon];
}

function standard({title, fileName}) {
  const contents = fs.readFileSync(fileName, 'utf8');
  const lines = contents.split('\n');
  const dataSet = {
    name: title,
    dataByCityID: {},
  };

  // Skip the header line
  for (const line of lines.slice(1)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const {id, city, state} = parseIDAndName(eat);

    eat(13).split('-'); // fromDate-toDate

    dataSet.dataByCityID[id] = {id, city, state, valueByMonth: []};
    for (let i = 0; i < 12; i++) {
      const stringValue = eat(6).trim();
      const value = stringValue === '*' ? 0 : Number(stringValue);
      dataSet.dataByCityID[id].valueByMonth.push(value);
    }

    dataSet.dataByCityID[id].annualValue = eat(6).trim();
  }

  return dataSet;
}

function maxWind({title, fileName}) {
  const contents = fs.readFileSync(fileName, 'utf8');
  const lines = contents.split('\n');
  const dataSet = {
    name: title,
    dataByCityID: {},
  };

  // Skip the first two header lines
  for (const line of lines.slice(2)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const {id, city, state} = parseIDAndName(eat);

    eat(13).split('-'); // fromDate-toDate

    dataSet.dataByCityID[id] = {id, city, state, valueByMonth: []};

    for (let i = 0; i < 12; i++) {
      eat(4); // direciton
      const stringValue = eat(4).trim();
      const value = stringValue === '*' ? 0 : Number(stringValue);
      dataSet.dataByCityID[id].valueByMonth.push(value);
    }

    dataSet.dataByCityID[id].annualValue = eat(6).trim();
  }

  return dataSet;
}

function cloudiness({title, fileName}) {
  const contents = fs.readFileSync(fileName, 'utf8');
  const lines = contents.split('\n');
  const dataSets = [
    {
      name: 'Cloudiness - Mean Number of Days (Clear)',
      dataByCityID: {},
    },
    {
      name: 'Cloudiness - Mean Number of Days (Partly Cloudy)',
      dataByCityID: {},
    },
    {
      name: 'Cloudiness - Mean Number of Days (Cloudy)',
      dataByCityID: {},
    },
  ];

  // Skip the first two header lines
  for (const line of lines.slice(2)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const {id, city, state} = parseIDAndName(eat);

    dataSets.forEach(ds => {
      ds.dataByCityID[id] = {id, city, state, valueByMonth: []};
    });

    eat(3); // Years

    for (let i = 0; i < 12; i++) {
      dataSets.forEach(ds => {
        ds.dataByCityID[id].valueByMonth.push(Number(eat(3).trim()));
      });
    }

    dataSets.forEach(ds => {
      ds.dataByCityID[id].annualValue = Number(eat(3).trim());
    });
  }

  return dataSets;
}

function normals({title, fileName, hasCommas}) {
  const contents = fs.readFileSync(fileName, 'utf8').trim();
  const lines = contents.split('\n');
  const dataSet = {
    name: title,
    dataByCityID: {},
  };

  // Skip the first header line
  for (const line of lines.slice(1)) {
    if (!line.trim().length) {
      continue;
    }

    const eat = chomper(line);
    const {id, city, state} = parseIDAndName(eat, hasCommas);

    dataSet.dataByCityID[id] = {id, city, state, valueByMonth: []};

    eat(4); // Years

    // In the files with commas, some do not have fixed size columns,
    // e.g. nrmcdd, so just parse the commas.
    if (hasCommas) {
      const values = eat(Number.MAX_SAFE_INTEGER)
        .split(',')
        .map(v => Number(v.trim()));
      dataSet.dataByCityID[id].valueByMonth = values.slice(0, -1);
      dataSet.dataByCityID[id].annualValue = values[values.length - 1];
    } else {
      for (let i = 0; i < 12; i++) {
        dataSet.dataByCityID[id].valueByMonth.push(eat(7).trim());
      }
      dataSet.dataByCityID[id].annualValue = eat(6).trim();
    }
  }

  return dataSet;
}

// Some datasets have different IDs for the same name. If we find an existing ID
// for the name, use that ID instead.
const idByName = {};
function getID(id, city, state) {
  const name = city + state;
  if (idByName[name]) {
    return idByName[name];
  }
  idByName[name] = id;
  return id;
}

function parseIDAndName(eat, hasCommas) {
  const rawID = eat(5);

  hasCommas && eat(1); // Comma

  const name = eat(32).trim();
  let city, state;
  if (name.includes(',')) {
    [city, state] = name.split(',');
  } else {
    city = name.slice(0, -2);
    state = name.slice(-2);
  }

  city = cleanCity(city);
  state = state.trim();

  const id = getID(rawID, city, state);

  return {id, city, state};
}

const files = [
  {
    title: 'Mean Number of Days Maximum Temperature 90°F or Higher',
    fileName: 'mxge9018.dat',
    parser: standard,
  },
  {
    title: 'Mean Number of Days Minimum Temperature 32°F or Less',
    fileName: 'mnls3218.dat',
    parser: standard,
  },
  {
    title: 'Mean Number of Days with Precipitation 0.01 Inch or More',
    fileName: 'prge0118.dat',
    parser: standard,
  },
  {
    title:
      'Snowfall (Including Ice Pellets and Sleet) - Average Total in Inches',
    fileName: 'avgsnf18.dat',
    parser: standard,
  },
  {
    title: 'Wind - Average Speed (MPH)',
    fileName: 'wndspd18.dat',
    parser: standard,
  },
  {
    title: 'Wind - Maximum Speed (MPH)',
    fileName: 'maxwnd18.dat',
    parser: maxWind,
  },
  {
    title: 'Sunshine - Average Percent of Possible',
    fileName: 'pctpos18.dat',
    parser: standard,
  },
  {
    title: 'Cloudiness - Mean Number of Days (Clear, Partly Cloudy, Cloudy)',
    fileName: 'clpcdy18.dat',
    parser: cloudiness,
  },
  {
    title: 'Average Relative Humidity - Morning (M), Afternoon (A)',
    fileName: 'relhum18.dat',
    parser: relativeHumdity,
  },
  {
    title: 'Normal Daily Maximum Temperature, °F',
    fileName: 'nrmmax.txt',
    parser: normals,
    hasCommas: true,
  },
  {
    title: 'Normal Daily Minimum Temperature, °F',
    fileName: 'nrmmin.txt',
    parser: normals,
    hasCommas: false,
  },
  {
    title: 'Normal Daily Mean Temperature, °F',
    fileName: 'nrmavg.txt',
    parser: normals,
    hasCommas: true,
  },
  {
    title: 'Normal Heating Degree Days (July–June) Base 65 °F',
    fileName: 'nrmhdd.txt',
    parser: normals,
    hasCommas: true,
  },
  {
    title: 'Normal Cooling Degree Days (January–December) Base 65 °F',
    fileName: 'nrmcdd.txt',
    parser: normals,
    hasCommas: true,
  },
  {
    title: 'Normal Precipitation, Inches',
    fileName: 'nrmpcp.txt',
    parser: normals,
    hasCommas: true,
  },
];

const dataSets = files.flatMap(f => (f.parser ? f.parser(f) : []));

fs.writeFileSync('../src/data.json', JSON.stringify(dataSets, null, 2), 'utf8');

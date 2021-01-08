import {ResponsiveLine} from '@nivo/line';
import {
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
} from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import DataSetsRaw from './data.json';
import useLocalStorage from './useLocalStorage';

const {Title} = Typography;

const cities = Object.values(DataSetsRaw[0].dataByCityID).sort((a, b) =>
  a.city.localeCompare(b.city),
);

const Humidity = DataSetsRaw.find(
  ds => ds.name === 'Average Relative Humidity (Afternoon)',
);
const Temp = DataSetsRaw.find(
  ds => ds.name === 'Normal Daily Maximum Temperature, °F',
);
const DataSets = DataSetsRaw.concat({
  name: 'Dew Point, °F',
  dataByCityID: cities.reduce((acc, {id, city, state}) => {
    const hum = Humidity.dataByCityID[id]?.valueByMonth;
    const temp = Temp.dataByCityID[id]?.valueByMonth;
    if (!hum || !temp) {
      return acc;
    }
    const valueByMonth = hum.map((h, i) => dewPoint(h, temp[i]));
    acc[id] = {id, city, state, valueByMonth};
    return acc;
  }, {}),
});

const cityOptions = cities.map(loc => (
  <Select.Option key={loc.id} value={loc.id}>
    {loc.city}, {loc.state}
  </Select.Option>
));

const dataSetOptions = DataSets.map(ds => (
  <Select.Option key={ds.name}>{ds.name}</Select.Option>
));

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function App() {
  const [cityIDs, setCityIDs] = useLocalStorage('cityIDs', [
    '13959',
    '13891',
    '14839',
  ]);
  const [dataSetNames, setDataSetNames] = useLocalStorage('dataSetNames', [
    'Normal Daily Maximum Temperature, °F',
    'Dew Point, °F',
  ]);
  const [startAtZeroCheckbox, shouldStartAtZero] = useCheckbox('Start at zero');
  const [hasPointLabelsCheckbox, hasPointLabels] = useCheckbox('Point labels');
  const [showStatsCheckbox, shouldShowStats] = useCheckbox('Show stats');

  const selectedDataSets = DataSets.filter(ds =>
    dataSetNames.includes(ds.name),
  );
  const charts = selectedDataSets.map(ds => ({
    name: ds.name,
    data: cityIDs
      .filter(loc => ds.dataByCityID[loc])
      .map(loc => ({
        id: ds.dataByCityID[loc].city,
        data: ds.dataByCityID[loc].valueByMonth.map((v, i) => ({
          x: monthNames[i],
          y: v,
        })),
      })),
  }));

  return (
    <div className="App">
      <header>
        <Title>Compare Climates of U.S. Cities 🌤</Title>
      </header>
      <main>
        <Form layout="vertical">
          <Form.Item label="Cities">
            <Select
              allowClear
              mode="multiple"
              optionFilterProp="children"
              onChange={setCityIDs}
              placeholder="Select Locations"
              style={{width: '100%'}}
              value={cityIDs}>
              {cityOptions}
            </Select>
          </Form.Item>
          <Form.Item label="Data Sets">
            <Select
              allowClear
              mode="multiple"
              optionFilterProp="children"
              onChange={setDataSetNames}
              placeholder="Select Data Sets"
              style={{width: '100%'}}
              value={dataSetNames}>
              {dataSetOptions}
            </Select>
          </Form.Item>
          <Form.Item label="Settings">
            <Space>
              {startAtZeroCheckbox}
              {hasPointLabelsCheckbox}
              {showStatsCheckbox}
            </Space>
          </Form.Item>

          {shouldShowStats && (
            <Form.Item label="Statistics">
              <Stats />
            </Form.Item>
          )}

          {charts.map(chart => (
            <Form.Item
              key={
                chart.name + shouldStartAtZero + hasPointLabels + cityIDs.length
              }
              label={chart.name}>
              <div style={{height: 300}}>
                <ResponsiveLine
                  data={chart.data}
                  margin={{top: 20, right: 20, bottom: 50, left: 30}}
                  xScale={{type: 'point'}}
                  yScale={{
                    type: 'linear',
                    min: shouldStartAtZero ? 0 : 'auto',
                    max: 'auto',
                    stacked: false,
                    reverse: false,
                  }}
                  curve="catmullRom"
                  colors={{scheme: 'category10'}}
                  pointSize={5}
                  pointBorderWidth={2}
                  pointLabelYOffset={-12}
                  useMesh
                  enablePointLabel={hasPointLabels}
                  enableSlices="x"
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 50,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 120,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                />
              </div>
            </Form.Item>
          ))}
        </Form>
      </main>
      <footer>
        Made with 🚀 by <a href="https://ianobermiller.com">Ian Obermiller</a>.
        Data from the{' '}
        <a href="https://www.ncdc.noaa.gov/ghcn/comparative-climatic-data">
          NOAA
        </a>
        . Charts by <a href="https://nivo.rocks/">Nivo</a>. UI by{' '}
        <a href="https://ant.design/">Ant Design</a>. Favicon by{' '}
        <a href="https://favicon.io/emoji-favicons/sun-behind-small-cloud/">
          Favicon.io
        </a>
        . Source on{' '}
        <a href="https://github.com/ianobermiller/climate-compare">GitHub</a>.
      </footer>
    </div>
  );
}

function useCheckbox(label) {
  const [isChecked, setIsChecked] = useLocalStorage(label, false);
  const element = (
    <Checkbox
      onChange={e => setIsChecked(e.target.checked)}
      checked={isChecked}>
      {label}
    </Checkbox>
  );
  return [element, isChecked];
}

function Stats() {
  const allDataPoints = DataSets.flatMap(ds => Object.values(ds.dataByCityID));
  const dedupeID = group(allDataPoints, c => c.id);
  const dedupeName = group(allDataPoints, c => c.city + ', ' + c.state);
  const multipleIDs = Array.from(dedupeName.values())
    .filter(cities => cities.some(c => c.id !== cities[0].id))
    .map(cities => ({
      name: cities[0].city + ', ' + cities[0].state,
      ids: Array.from(new Set(cities.map(c => c.id))).join('\n'),
    }));
  const multipleNames = Array.from(dedupeID.values())
    .filter(cities => cities.some(c => c.city !== cities[0].city))
    .map(cities => ({
      id: cities[0].id,
      names: Array.from(new Set(cities.map(c => c.city))).join('\n'),
    }));
  return (
    <Row gutter={[16, 16]}>
      <Col span="8">
        <Statistic title="Data Points" value={allDataPoints.length} />
      </Col>
      <Col span="8">
        <Statistic title="Unique City IDs" value={dedupeID.size} />
      </Col>
      <Col span="8">
        <Statistic title="Unique Names" value={dedupeName.size} />
      </Col>
      <Col span="8">
        <Statistic title="Multiple IDs" value={multipleIDs.length} />
      </Col>
      <Col span="8">
        <Statistic title="Multiple Names" value={multipleNames.length} />
      </Col>
    </Row>
  );
}

function group(items, getKey) {
  const result = new Map();
  for (const item of items) {
    const key = getKey(item);
    const list = result.get(key) ?? [];
    list.push(item);
    result.set(key, list);
  }
  return result;
}

// https://bmcnoldy.rsmas.miami.edu/Humidity.html
function dewPoint(relativeHumidity, tempInF) {
  return Math.round(
    (243.04 *
      (Math.log(relativeHumidity / 100) +
        (17.625 * tempInF) / (243.04 + tempInF))) /
      (17.625 -
        Math.log(relativeHumidity / 100) -
        (17.625 * tempInF) / (243.04 + tempInF)),
  );
}

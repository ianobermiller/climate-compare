import {ResponsiveLine} from '@nivo/line';
import {Checkbox, Form, Select, Space, Typography} from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import DataSets from './data.json';
import useLocalStorage from './useLocalStorage';

const {Title} = Typography;

const cities = Object.values(DataSets[0].dataByCityID).sort((a, b) =>
  a.city.localeCompare(b.city),
);

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
  const [dataSetNames, setDataSetNames] = useLocalStorage(
    'dataSetNames',
    DataSets.map(ds => ds.name).filter(n => n.includes('Daily')),
  );
  const [shouldStartAtZero, setShouldStartAtZero] = useLocalStorage(
    'shouldStartAtZero',
    false,
  );
  const [hasPointLabels, setHasPointLabels] = useLocalStorage(
    'hasPointLabels',
    false,
  );

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
              <Checkbox
                onChange={e => setShouldStartAtZero(e.target.checked)}
                checked={shouldStartAtZero}>
                Start at zero
              </Checkbox>
              <Checkbox
                onChange={e => setHasPointLabels(e.target.checked)}
                checked={hasPointLabels}>
                Point labels
              </Checkbox>
            </Space>
          </Form.Item>
          {charts.map(chart => (
            <Form.Item
              key={chart.name + shouldStartAtZero + hasPointLabels}
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

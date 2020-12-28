import {ResponsiveLine} from '@nivo/line';
import 'semantic-ui-css/semantic.min.css';
import {
  Checkbox,
  Container,
  Dropdown,
  Form,
  Header,
  List,
  Segment,
} from 'semantic-ui-react';
import './App.css';
import DataSets from './data.json';
import useLocalStorage from './useLocalStorage';

const cities = Object.values(DataSets[0].dataByCityID).sort((a, b) =>
  a.city.localeCompare(b.city),
);

const cityOptions = cities.map(loc => ({
  key: loc.id,
  text: loc.city + ', ' + loc.state,
  value: loc.id,
}));

const dataSetOptions = DataSets.map(ds => ({
  key: ds.name,
  text: ds.name,
  value: ds.name,
}));

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
    dataSetOptions.map(o => o.value),
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
    <Container text>
      <Segment basic>
        <Header as="h1">Compare Climates of U.S. Cities 🌤</Header>
        <Form>
          <Form.Field>
            <label>Cities</label>
            <Dropdown
              fluid
              multiple
              onChange={(e, {value}) => setCityIDs(value)}
              options={cityOptions}
              placeholder="Select Locations"
              search
              selection
              value={cityIDs}
            />
          </Form.Field>
          <Form.Field>
            <label>Data</label>
            <Dropdown
              fluid
              multiple
              onChange={(e, {value}) => setDataSetNames(value)}
              options={dataSetOptions}
              placeholder="Select Data Sets"
              search
              selection
              value={dataSetNames}
            />
          </Form.Field>
          <Form.Field>
            <List horizontal>
              <List.Item>
                <Checkbox
                  checked={shouldStartAtZero}
                  label="Start at zero"
                  onChange={(e, {checked}) => setShouldStartAtZero(checked)}
                />
              </List.Item>
              <List.Item>
                <Checkbox
                  checked={hasPointLabels}
                  label="Point labels"
                  onChange={(e, {checked}) => setHasPointLabels(checked)}
                />
              </List.Item>
            </List>
          </Form.Field>
          {charts.map(chart => (
            <Form.Field key={chart.name}>
              <label>{chart.name}</label>
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
            </Form.Field>
          ))}
        </Form>
      </Segment>
      <Segment basic>
        Data from the{' '}
        <a href="https://www.ncdc.noaa.gov/ghcn/comparative-climatic-data">
          NOAA
        </a>
        . Made with 🚀 by <a href="https://ianobermiller.com">Ian Obermiller</a>
        .
      </Segment>
    </Container>
  );
}

import {ResponsiveLine} from '@nivo/line';
import './App.css';

const data = [
  {
    id: 'japan',
    color: 'hsl(197, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 70,
      },
      {
        x: 'helicopter',
        y: 237,
      },
      {
        x: 'boat',
        y: 275,
      },
      {
        x: 'train',
        y: 131,
      },
      {
        x: 'subway',
        y: 133,
      },
      {
        x: 'bus',
        y: 249,
      },
      {
        x: 'car',
        y: 10,
      },
      {
        x: 'moto',
        y: 229,
      },
      {
        x: 'bicycle',
        y: 155,
      },
      {
        x: 'horse',
        y: 75,
      },
      {
        x: 'skateboard',
        y: 5,
      },
      {
        x: 'others',
        y: 31,
      },
    ],
  },
  {
    id: 'france',
    color: 'hsl(103, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 133,
      },
      {
        x: 'helicopter',
        y: 216,
      },
      {
        x: 'boat',
        y: 41,
      },
      {
        x: 'train',
        y: 112,
      },
      {
        x: 'subway',
        y: 11,
      },
      {
        x: 'bus',
        y: 287,
      },
      {
        x: 'car',
        y: 130,
      },
      {
        x: 'moto',
        y: 48,
      },
      {
        x: 'bicycle',
        y: 15,
      },
      {
        x: 'horse',
        y: 156,
      },
      {
        x: 'skateboard',
        y: 199,
      },
      {
        x: 'others',
        y: 17,
      },
    ],
  },
  {
    id: 'us',
    color: 'hsl(22, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 185,
      },
      {
        x: 'helicopter',
        y: 300,
      },
      {
        x: 'boat',
        y: 35,
      },
      {
        x: 'train',
        y: 179,
      },
      {
        x: 'subway',
        y: 62,
      },
      {
        x: 'bus',
        y: 256,
      },
      {
        x: 'car',
        y: 174,
      },
      {
        x: 'moto',
        y: 130,
      },
      {
        x: 'bicycle',
        y: 117,
      },
      {
        x: 'horse',
        y: 258,
      },
      {
        x: 'skateboard',
        y: 1,
      },
      {
        x: 'others',
        y: 28,
      },
    ],
  },
  {
    id: 'germany',
    color: 'hsl(52, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 171,
      },
      {
        x: 'helicopter',
        y: 37,
      },
      {
        x: 'boat',
        y: 2,
      },
      {
        x: 'train',
        y: 110,
      },
      {
        x: 'subway',
        y: 61,
      },
      {
        x: 'bus',
        y: 261,
      },
      {
        x: 'car',
        y: 64,
      },
      {
        x: 'moto',
        y: 18,
      },
      {
        x: 'bicycle',
        y: 243,
      },
      {
        x: 'horse',
        y: 154,
      },
      {
        x: 'skateboard',
        y: 30,
      },
      {
        x: 'others',
        y: 83,
      },
    ],
  },
  {
    id: 'norway',
    color: 'hsl(52, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 129,
      },
      {
        x: 'helicopter',
        y: 48,
      },
      {
        x: 'boat',
        y: 55,
      },
      {
        x: 'train',
        y: 142,
      },
      {
        x: 'subway',
        y: 72,
      },
      {
        x: 'bus',
        y: 272,
      },
      {
        x: 'car',
        y: 210,
      },
      {
        x: 'moto',
        y: 253,
      },
      {
        x: 'bicycle',
        y: 44,
      },
      {
        x: 'horse',
        y: 3,
      },
      {
        x: 'skateboard',
        y: 183,
      },
      {
        x: 'others',
        y: 227,
      },
    ],
  },
];

export default function App() {
  return (
    <div className="App">
      <div style={{height: 400}}>
        <ResponsiveLine
          data={data}
          margin={{top: 50, right: 110, bottom: 50, left: 60}}
          xScale={{type: 'point'}}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="catmullRom"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          colors={{scheme: 'category10'}}
          pointSize={10}
          pointColor={{theme: 'background'}}
          pointBorderWidth={2}
          pointBorderColor={{from: 'serieColor'}}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
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
    </div>
  );
}

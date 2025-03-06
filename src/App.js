import logo from './logo.svg';
import './App.css';

function App() {

    const mapString = `  @---A---+
          |
  x-B-+   C
      |   |
      +---+`;

    const mapArray = mapString
        .split('\n')
        .map(row =>
            row.split('')
        );


    console.log('map array', mapArray);

    return (
        <div>
            <table style={{ borderCollapse: 'collapse', width: '50%', margin: '20px auto', border: '1px solid black' }}>
                <tbody>
                    {mapArray.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    style={{
                                        border: '1px solid black',
                                        padding: '8px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;

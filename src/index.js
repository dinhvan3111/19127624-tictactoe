import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

function Square(props) {
  return (
    <button
      className={
        `square` +
        ` ${props.isLatestMove ? `bold` : ``} + ${
          props.highlight ? " highlight" : ""
        }`
      }
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    const isLatestMove = this.props.latestMove === i;
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isLatestMove={isLatestMove ? "bold" : ""}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    return (
      // <div>
      //   <div className="board-row">
      //     {this.renderSquare(0)}
      //     {this.renderSquare(1)}
      //     {this.renderSquare(2)}
      //   </div>
      //   <div className="board-row">
      //     {this.renderSquare(3)}
      //     {this.renderSquare(4)}
      //     {this.renderSquare(5)}
      //   </div>
      //   <div className="board-row">
      //     {this.renderSquare(6)}
      //     {this.renderSquare(7)}
      //     {this.renderSquare(8)}
      //   </div>
      // </div>
      <div className="game-board">
        {this.props.squares.map((item, index) => this.renderSquare(index))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(25).fill(null),
          latestMoveSquare: -1,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      sortMoveAcs: true,
    };
  }

  numToCoordinate(latestMoveSquare) {
    const col = 1 + (latestMoveSquare % 5);
    const row = 1 + Math.floor(latestMoveSquare / 5);
    return { col: col, row: row };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const sortMoveAcs = this.state.sortMoveAcs;
    console.log(calculateWinner(squares));
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          latestMoveSquare: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      sortMoveAcs: sortMoveAcs,
    });
  }

  // handleClickToggle() {
  //   console.log(this.state);
  //   const current = this.state.sortMoveAcs;
  //   this.setState({
  //     sortMoveAcs: !current,
  //   });
  //   console.log(this.state.sortMoveAcs);
  // }

  jumpTo(step) {
    const sortMoveAcs = this.state.sortMoveAcs;
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
      sortMoveAcs: sortMoveAcs,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo.winner;
    var moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const location = this.numToCoordinate(latestMoveSquare);
      const col = location.col;
      const row = location.row;
      const desc = move
        ? "Go to move #" + move + " ( Column: " + col + ", Row: " + row + ")"
        : "Go to game start";
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            style={{
              backgroundColor:
                this.state.stepNumber === move ? "blue" : "white",
              borderRadius: "8px",
              color: this.state.stepNumber === move ? "white" : "black",
            }}
          >
            {desc}
          </button>
        </li>
      );
    });
    moves = this.state.sortMoveAcs ? moves : moves.reverse();
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winnerInfo.isDraw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    return (
      <div className="game">
        <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
          latestMove={current.latestMoveSquare}
          winLine={winnerInfo.line}
        />
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>
            <span>Sort</span>
            <Toggle
              onClick={() => {
                this.setState({ sortMoveAcs: !this.state.sortMoveAcs });
              }}
            ></Toggle>
          </div>
        </div>
      </div>
    );
  }
}

function Toggle(props) {
  const [isActive, setIsActive] = useState(false);
  const handleToggle = () => {
    setIsActive((on) => !on);
    props.onClick();
  };
  return (
    <div>
      <div
        className={`toggle ${isActive ? "active" : ""}`}
        onClick={handleToggle}
      >
        <div className={`spinner ${isActive ? "active" : ""}`}></div>
      </div>
    </div>
  );
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const size = 5;
  const diag = new Array(2).fill(0);
  const lineDiag = [
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];
  console.log("squares", squares);
  for (let i = 0; i < size; i++) {
    let flag = 0;
    let flagY = 0;
    for (let j = 0; j < size; j++) {
      if (squares[i * size + j] === "X") {
        flag += 1;
      } else if (squares[i * size + j] === "O") {
        flag -= 1;
      }
      if (squares[i + j * size] === "X") {
        flagY += 1;
      } else if (squares[i + j * size] === "O") {
        flagY -= 1;
      }

      const pos = i * size + j;
      if (pos % size === Math.floor(pos / size)) {
        if (squares[pos] === "X") diag[0] += 1;
        else if (squares[pos] === "O") diag[0] -= 1;
      }

      if (pos % (size - 1) === 0) {
        if (squares[pos] === "X") diag[1] += 1;
        else if (squares[pos] === "O") diag[1] -= 1;
      }
    }
    if (flagY === -size || flagY === size) {
      let line = [];
      for (let index = 0; index < size; index++) {
        line.push(i + index * size);
      }
      if (flagY === -size) {
        return { winner: "O", line: line, isDraw: false };
      } else if (flagY === size) {
        return { winner: "X", line: line, isDraw: false };
      }
    }
    if (flag === -size || flag === size) {
      let line = [];
      for (let index = 0; index < size; index++) {
        line.push(i * size + index);
      }
      if (flag === -size) {
        return { winner: "X", line: line, isDraw: false };
      } else if (flag === size) {
        return { winner: "O", line: line, isDraw: false };
      }
    }
  }
  if (diag[0] === -size || diag[0] === size) {
    if (diag[0] === -size) {
      return { winner: "O", line: lineDiag[0], isDraw: false };
    } else if (diag[0] === size) {
      return { winner: "X", line: lineDiag[0], isDraw: false };
    }
  }

  if (diag[1] === -size || diag[1] === size) {
    if (diag[1] === -size) {
      return { winner: "O", line: lineDiag[1], isDraw: false };
    } else if (diag[1] === size) {
      return { winner: "X", line: lineDiag[1], isDraw: false };
    }
  }

  return {
    winner: null,
    line: null,
    isDraw: true,
  };
}

// function calculateWinner(squares) {
//   const rows = new Array(5).fill(0);
//   const cols = new Array(5).fill(0);
//   const diag = new Array(2).fill(0);
//   for (let row = 0; row < 5; row++) {
//     for (let col = 0; col < 5; col++) {
//       const square = squares[row * 5 + col];
//       if (square === "X") {
//         rows[row]++;
//         cols[col]++;
//       } else if (square === "O") {
//         rows[row]--;
//         cols[col]--;
//       }
//       if (row === col) diag[0] += square === "X" ? 1 : -1;
//       if (row === 5 - col - 1) diag[1] += square === "X" ? 1 : -1;
//     }
//   }
//   for (let i = 0; i < 5; i++) {
//     if (rows[i] === 5 || cols[i] === 5) return { winner: "X", isDraw: false };
//     else if (rows[i] === -5 || cols[i] === -5)
//       return { winner: "O", isDraw: false };
//   }
//   if (diag[0] === 5 || diag[1] === 5) return { winner: "X", isDraw: false };
//   else if (diag[0] === -5 || diag[1] === -5)
//     return { winner: "O", isDraw: false };
//   let isDraw = true;
//   for (let i = 0; i < squares.length; i++) {
//     if (squares[i] === null) {
//       isDraw = false;
//       break;
//     }
//   }
//   // otherwise no winner is found
//   return {
//     winner: null,
//     isDraw: isDraw,
//   };
// }

// function calculateWinner(squares) {
//   const lines = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6],
//   ];
//   // Check if there is a winner
//   for (let i = 0; i < lines.length; i++) {
//     const [a, b, c] = lines[i];
//     if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
//       return { winner: squares[a], line: lines[i], isDraw: false };
//     }
//   }
//   // Check if the board is filled all
//   let isDraw = true;
//   for (let i = 0; i < squares.length; i++) {
//     if (squares[i] === null) {
//       isDraw = false;
//       break;
//     }
//   }
//   return {
//     winner: null,
//     line: null,
//     isDraw: isDraw,
//   };
// }

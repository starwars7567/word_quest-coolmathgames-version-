import { useState, useEffect, useRef } from 'react';
import './App.css';
import WORDS from './sgb-words';

const ANSWER = WORDS[Math.floor(Math.random() * WORDS.length)];

function getFeedback(guess, answer) {
  const feedback = Array(5).fill('gray');
  const answerArr = answer.split('');
  const guessArr = guess.split('');

  // First pass: green for correct position
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      feedback[i] = 'green';
      answerArr[i] = null;
      guessArr[i] = null;
    }
  }
  // Second pass: yellow for correct letter wrong position
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] && answerArr.includes(guessArr[i])) {
      feedback[i] = 'yellow';
      answerArr[answerArr.indexOf(guessArr[i])] = null;
    }
  }
  return feedback;
}

// Keyboard layout
const KEY_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['Enter','z','x','c','v','b','n','m','Backspace']
];

function App() {
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [keyColors, setKeyColors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Keyboard input handler
  useEffect(() => {
    if (gameOver) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleGuess();
      } else if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && input.length < 5) {
        setInput((prev) => prev + e.key.toLowerCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [input, gameOver]);

  // Update key colors whenever guesses change
  useEffect(() => {
    // Track best color for each key
    const colors = {};
    guesses.forEach(({ guess, feedback }) => {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const color = feedback[i];
        if (!colors[letter]) {
          colors[letter] = color;
        } else {
          // green > yellow > gray
          if (color === 'green') colors[letter] = 'green';
          else if (color === 'yellow' && colors[letter] !== 'green') colors[letter] = 'yellow';
          else if (color === 'gray' && colors[letter] !== 'green' && colors[letter] !== 'yellow') colors[letter] = 'gray';
        }
      }
    });
    setKeyColors(colors);
  }, [guesses]);

  const handleGuess = () => {
    if (input.length !== 5 || !WORDS.includes(input)) {
      setMessage('Guess must be a valid 5-letter word!');
      return;
    }
    const feedback = getFeedback(input, ANSWER);
    const newGuesses = [...guesses, { guess: input, feedback }];
    setGuesses(newGuesses);
    setInput('');
    if (input === ANSWER) {
      setMessage('Congratulations! You guessed the word!');
      setGameOver(true);
    } else if (newGuesses.length >= 6) {
      setMessage(`Game over! The word was "${ANSWER}".`);
      setGameOver(true);
    } else {
      setMessage('');
    }
  };

  const handleKeyClick = (key) => {
    if (gameOver) return;
    if (key === 'Enter') {
      handleGuess();
    } else if (key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key) && input.length < 5) {
      setInput((prev) => prev + key);
    }
  };

  return (
    <div className="center-outer">
      <div className="container">
        <h1>WordQuest</h1>
        <div className="board">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <div className="row" key={rowIdx}>
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const guessObj = guesses[rowIdx];
                const letter = guessObj ? guessObj.guess[colIdx] : '';
                const color = guessObj ? guessObj.feedback[colIdx] : '';
                return (
                  <div className={`tile ${color}`} key={colIdx}>
                    {letter ? letter.toUpperCase() : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {!gameOver && (
          <>
            <div className="input-area">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value.toLowerCase())}
                maxLength={5}
                style={{ textTransform: 'lowercase', marginRight: 10 }}
                placeholder="Type a 5-letter word"
                autoFocus
              />
              <button onClick={handleGuess}>Guess</button>
            </div>
            <div className="keyboard">
              {KEY_ROWS.map((row, idx) => (
                <div className="keyboard-row" key={idx}>
                  {row.map((key) => {
                    let keyClass = 'key';
                    if (key === 'Enter') keyClass += ' enter-key';
                    if (key === 'Backspace') keyClass += ' backspace-key';
                    if (keyColors[key]) keyClass += ` ${keyColors[key]}`;
                    return (
                      <button
                        key={key}
                        className={keyClass}
                        onClick={() => handleKeyClick(key)}
                        tabIndex={-1}
                      >
                        {key === 'Backspace' ? '⌫' : key === 'Enter' ? '⏎' : key.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="message">{message}</div>
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './GameBoard.css';
import collectSound from "../assets/collectSound.mp3";
import errorSound from "../assets/errorSound.mp3";

const initialSnake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
    { x: 2, y: 5 }
];

const getRandomPosition = () => ({
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 10)
});

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        display: 'grid',
        placeItems: "center",
        rowGap:'1vh',
        // height: '15vh',
        width: '20vw'
    },
    overlay: {
        background: '#000000cd'
    }
};

const GameBoard = () => {
    const [snakes, setSnakes] = useState([initialSnake]);
    const [diamond, setDiamond] = useState(getRandomPosition());
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [gameOn, setGameOn] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(true);
    const [collided, setCollided] = useState(false);
    const [winner, setWinner] = useState(false);

    useEffect(() => {
        if (gameOn && !winner) {
            const interval = setInterval(() => {
                moveSnakes();
            }, 500);
            return () => clearInterval(interval);
        }
    }, [gameOn, winner]);

    useEffect(() => {
        if (score >= 150) {
            setWinner(true);
            setGameOn(false);
            setModalIsOpen(true);
        }
    }, [score]);

    const moveSnakes = () => {
        setSnakes(prevSnakes => prevSnakes.map(snake => {
            const directions = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ];
            const direction = directions[Math.floor(Math.random() * 4)];
            const newHead = {
                x: Math.max(0, Math.min(19, (snake[0].x + direction.x + 20) % 20)),
                y: Math.max(0, Math.min(9, (snake[0].y + direction.y + 10) % 10))
            };
            const overlap = snake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
                (newHead.x === diamond.x && newHead.y === diamond.y);
            if (overlap) {
                return snake;
            }
            const newSnake = [newHead, ...snake.slice(0, snake.length - 1)];
            return newSnake;
        }));
    };

    const handleMouseMove = (e) => {
        const grid = e.currentTarget;
        const rect = grid.getBoundingClientRect();
        const cellWidth = rect.width / 20;
        const cellHeight = rect.height / 10;

        const x = Math.min(19, Math.max(0, Math.floor((e.clientX - rect.left) / cellWidth)));
        const y = Math.min(9, Math.max(0, Math.floor((e.clientY - rect.top) / cellHeight)));

        const newPlayerPosition = { x, y };

        const playerHit = snakes.some(snake =>
            snake.some(segment => segment.x === newPlayerPosition.x && segment.y === newPlayerPosition.y)
        );

        if (playerHit && !collided) {
            const collideSound = new Audio(errorSound);
            collideSound.play();
            setScore(prevScore => prevScore - 10);
            setCollided(true);
        } else if (!playerHit) {
            setCollided(false);
        }

        setPlayer(newPlayerPosition);
    };

    const handleClick = (x, y) => {
        if (x === diamond.x && y === diamond.y) {
            const diamondCollect = new Audio(collectSound);
            diamondCollect.play();
            setScore(prevScore => prevScore + 10);
            let newDiamondPosition = getRandomPosition();

            while (snakes.some(snake =>
                snake.some(segment => segment.x === newDiamondPosition.x && segment.y === newDiamondPosition.y)
            )) {
                newDiamondPosition = getRandomPosition();
            }

            setDiamond(newDiamondPosition);

            const newSnakeHead = getRandomPosition();
            const newSnake = [];
            const directions = [
                { x: 0, y: 1 },
                { x: 0, y: -1 },
                { x: 1, y: 0 },
                { x: -1, y: 0 }
            ];

            let direction = directions[Math.floor(Math.random() * 4)];
            newSnake.push(newSnakeHead);

            for (let i = 1; i < initialSnake.length; i++) {
                const previousSegment = newSnake[i - 1];
                const newSegment = {
                    x: (previousSegment.x + direction.x + 20) % 20,
                    y: (previousSegment.y + direction.y + 10) % 10
                };

                if (newSegment.x === diamond.x && newSegment.y === diamond.y) {
                    direction = directions[Math.floor(Math.random() * 4)];
                    i--;
                } else {
                    newSnake.push(newSegment);
                }
            }

            setSnakes([...snakes, newSnake]);
        }
    };

    const restartGame = () => {
        setSnakes([initialSnake]);
        setDiamond(getRandomPosition());
        setPlayer({ x: 0, y: 0 });
        setScore(0);
        setGameOn(true);
        setModalIsOpen(false);
        setWinner(false);
        setCollided(false);
    };

    return (
        <div className='gameboard'>
            <h1 className="score">Score: {score}</h1>
            <div className="grid" onMouseMove={handleMouseMove} onClick={() => handleClick(player.x, player.y)}>
                {[...Array(20)].map((_, col) => (
                    <div key={col} className="col">
                        {[...Array(10)].map((_, row) => (
                            <div
                                key={row}
                                className={`cell ${player.x === col && player.y === row
                                    ? 'player'
                                    : snakes.some(snake => snake.some(segment => segment.x === col && segment.y === row))
                                        ? 'snake'
                                        : diamond.x === col && diamond.y === row
                                            ? 'diamond'
                                            : ''
                                    }`}
                            >
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {gameOn && <button onClick={() => { setGameOn(false); setModalIsOpen(true) }}>Stop Game!</button>}
            <Modal isOpen={modalIsOpen} onRequestClose={() => { setModalIsOpen(false) }} style={customStyles}>
                {!winner && <button onClick={() => { setModalIsOpen(false); setGameOn(true) }}>Start Game!</button>}
                {winner && <div>
                    <h2>Congratulations! You won!</h2>
                    <button onClick={restartGame}>Restart Game</button>
                </div>}
                {!winner && <button onClick={restartGame}>Restart Game</button>}
            </Modal>
        </div>
    );
};

export default GameBoard;

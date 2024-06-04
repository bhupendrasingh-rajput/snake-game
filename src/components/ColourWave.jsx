import React, { useEffect, useRef } from 'react';
import style from './ColourWave.module.css';

const ColourWave = () => {
    const gridRef = useRef(null);
    const timeoutsRef = useRef([]);

    const handleClick = (event) => {
        const clickedCell = event.target;
        if (!clickedCell.classList.contains(style.cell)) return;

        const cellX = parseInt(clickedCell.dataset.x, 10);
        const cellY = parseInt(clickedCell.dataset.y, 10);

        createWave(cellX, cellY);
    };

    const createWave = (cellX, cellY) => {
        const grid = gridRef.current;
        const cells = grid.getElementsByClassName(style.cell);
        const gridWidth = 20;
        const gridHeight = 10;
        const maxWaveRadius = Math.max(gridWidth, gridHeight);
        const colors = ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'];

        for (let r = 1; r <= maxWaveRadius; r++) {
            const color = colors[r % colors.length];
            const timeoutId = setTimeout(() => {
                for (let cell of cells) {
                    const x = parseInt(cell.dataset.x, 10);
                    const y = parseInt(cell.dataset.y, 10);

                    if (
                        (x >= cellX - r && x <= cellX + r && (y === cellY - r || y === cellY + r)) ||
                        (y >= cellY - r && y <= cellY + r && (x === cellX - r || x === cellX + r))
                    ) {
                        cell.style.backgroundColor = color;
                    }
                }

                const resetTimeoutId = setTimeout(() => {
                    for (let cell of cells) {
                        const x = parseInt(cell.dataset.x, 10);
                        const y = parseInt(cell.dataset.y, 10);

                        if (
                            (x >= cellX - r && x <= cellX + r && (y === cellY - r || y === cellY + r)) ||
                            (y >= cellY - r && y <= cellY + r && (x === cellX - r || x === cellX + r))
                        ) {
                            cell.style.backgroundColor = '';
                        }
                    }
                }, 200);

                timeoutsRef.current.push(resetTimeoutId);
            }, r * 100);

            timeoutsRef.current.push(timeoutId);
        }
    };

    useEffect(() => {
        const grid = gridRef.current;
        grid.addEventListener('click', handleClick);

        return () => {
            grid.removeEventListener('click', handleClick);
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className={style.gameboard}>
            <div className={style.grid} ref={gridRef}>
                {[...Array(20)].map((_, col) => (
                    <div key={col} className={style.col}>
                        {[...Array(10)].map((_, row) => (
                            <div key={row} className={style.cell} data-x={col} data-y={row}></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColourWave;

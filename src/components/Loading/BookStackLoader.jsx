/* eslint-disable prettier/prettier */
import React from 'react';

const BookStackLoader = () => {
  return (
    <>
      <div className="loader-container">
        <div className="book-stack">
          <div className="book book1"></div>
          <div className="book book2"></div>
          <div className="book book3"></div>
        </div>
      </div>

      <style>{`
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f3f4f6;
        }

        .book-stack {
          position: relative;
          width: 60px;
          height: 60px;
          animation: rotateStack 1.5s linear infinite;
        }

        .book {
          position: absolute;
          width: 50px;
          height: 10px;
          border-radius: 2px;
          transform-origin: center;
        }

        .book1 { background: #f87171; top: 0; left: 5px; }
        .book2 { background: #60a5fa; top: 15px; left: 5px; }
        .book3 { background: #34d399; top: 30px; left: 5px; }

        @keyframes rotateStack {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default BookStackLoader;

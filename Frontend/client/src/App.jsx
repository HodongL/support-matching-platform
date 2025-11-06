import { useState } from 'react'
import './App.css'

function App() {
  return (
    <>
      <header className="topbar">
        <div className="topbar__title">맞춤형 지원사업 플랫폼</div>
        <div className="topbar__actions">
          <button type="button" className="btn btn-ghost" id="resetBtn">초기화</button>
          <button type="button" className="btn btn-primary" id="searchBtn">검색</button>
        </div>
      </header>
      <main>
        <div className="filters">
          {/* 필터 컴포넌트들이 여기에 들어갈 예정 */}
        </div>
        <div className="results">
          {/* 결과 목록이 여기에 표시될 예정 */}
        </div>
      </main>
    </>
  )
}

export default App

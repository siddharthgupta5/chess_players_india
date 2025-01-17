
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [playersPerPage] = useState(20);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/players${
                        searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''
                    }`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch players');
                }
                
                const data = await response.json();
                setPlayers(data);
                setCurrentPage(1); // Reset to first page when new data is loaded
                setError(null);
            } catch (error) {
                console.error('Error fetching chess players:', error);
                setError('Failed to load chess players. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Add debounce to prevent too many API calls while typing
        const timeoutId = setTimeout(fetchPlayers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Get current players for pagination
    const indexOfLastPlayer = currentPage * playersPerPage;
    const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
    const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);
    const totalPages = Math.ceil(players.length / playersPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate page numbers array
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    // Navigate to previous/next page
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="container">
            <h1>Chess Players Information</h1>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search chess players by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            
            <div className="players-grid">
                {currentPlayers.length > 0 ? (
                    currentPlayers.map((player) => (
                        <div key={player._id} className="player-card">
                            <h2>{player.name}</h2>
                            <div className="player-details">
                                <p><strong>Indian Rank:</strong> {player.indianRank}</p>
                                <p><strong>Title:</strong> {player.title}</p>
                                <p><strong>Federation:</strong> {player.federation}</p>
                                <p><strong>Rating:</strong> {player.rating}</p>
                                <p><strong>Birth Year:</strong> {player.birthYear}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p className="no-results">No chess players found.</p>
                )}
            </div>

            {players.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={goToPreviousPage} 
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        Previous
                    </button>
                    
                    <div className="page-numbers">
                        {getPageNumbers().map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`page-number ${currentPage === number ? 'active' : ''}`}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            )}

            {players.length > 0 && (
                <div className="pagination-info">
                    Showing {indexOfFirstPlayer + 1}-{Math.min(indexOfLastPlayer, players.length)} of {players.length} players
                </div>
            )}
        </div>
    );
};

export default App;
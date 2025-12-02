import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Type } from 'lucide-react';

export default function MagnetBuilder() {
  const [baseImage, setBaseImage] = useState(null);
  const [customFont, setCustomFont] = useState(null);
  const [players, setPlayers] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [magnetWidth, setMagnetWidth] = useState(396);
  const [magnetHeight, setMagnetHeight] = useState(91);
  const [numberSize, setNumberSize] = useState(60);
  const [nameSize, setNameSize] = useState(40);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(2);
  const [numberX, setNumberX] = useState(20);
  const [diamondWidth, setDiamondWidth] = useState(28);
  const [diamondHeight, setDiamondHeight] = useState(14);
  const [diamondColor, setDiamondColor] = useState('#C5A572');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientStart, setGradientStart] = useState('#000000');
  const [gradientEnd, setGradientEnd] = useState('#FFFFFF');
  const [gradientDirection, setGradientDirection] = useState('horizontal');
  const [selectedTeam, setSelectedTeam] = useState('Custom');
  const canvasRef = useRef(null);

  const aflTeams = {
    'Custom': { primary: '#000000', secondary: '#FFFFFF' },
    'Adelaide Crows': { primary: '#002B5C', secondary: '#FFD200' },
    'Brisbane Lions': { primary: '#A30046', secondary: '#FDB515' },
    'Carlton': { primary: '#0E1E2D', secondary: '#B7B7B7' },
    'Collingwood': { primary: '#000000', secondary: '#FFFFFF' },
    'Essendon': { primary: '#CC2031', secondary: '#000000' },
    'Fremantle': { primary: '#2A1A54', secondary: '#FFFFFF' },
    'Geelong Cats': { primary: '#1C3C63', secondary: '#FFFFFF' },
    'Gold Coast Suns': { primary: '#B8282E', secondary: '#FDB71A' },
    'GWS Giants': { primary: '#F47920', secondary: '#0C1D2E' },
    'Hawthorn': { primary: '#4D2004', secondary: '#FDB71A' },
    'Melbourne': { primary: '#CC2031', secondary: '#0C1D2E' },
    'North Melbourne': { primary: '#003F87', secondary: '#FFFFFF' },
    'Port Adelaide': { primary: '#008AAB', secondary: '#000000' },
    'Richmond': { primary: '#FFD200', secondary: '#000000' },
    'St Kilda': { primary: '#ED0F05', secondary: '#000000' },
    'Sydney Swans': { primary: '#ED171F', secondary: '#FFFFFF' },
    'West Coast Eagles': { primary: '#002B5C', secondary: '#FDB71A' },
    'Western Bulldogs': { primary: '#014896', secondary: '#E40019' }
  };

  const handleTeamSelect = (teamName) => {
    setSelectedTeam(teamName);
    if (teamName !== 'Custom') {
      const team = aflTeams[teamName];
      setGradientStart(team.primary);
      setGradientEnd(team.secondary);
      setUseGradient(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBaseImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fontFace = new FontFace('CustomFont', `url(${event.target.result})`);
        fontFace.load().then((loaded) => {
          document.fonts.add(loaded);
          setCustomFont('CustomFont');
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const parsePlayerList = () => {
    if (!textInput.trim()) return;
    
    const lines = textInput.split('\n').filter(line => line.trim());
    const newPlayers = [];
    
    lines.forEach((line, index) => {
      let match = line.match(/^(\d+)[\s\t]+(.+)$/);
      
      if (!match) {
        const parts = line.split(/[\t\s]{2,}/);
        if (parts.length >= 2 && !isNaN(parts[0])) {
          match = [null, parts[0], parts.slice(1).join(' ')];
        }
      }
      
      if (match && match[1] && match[2]) {
        const fullName = match[2].trim().replace(/\s+/g, ' ').replace(/^\d+/, '').trim();
        const surname = fullName.toUpperCase();
        
        if (surname) {
          newPlayers.push({
            id: Date.now() + index,
            number: match[1],
            surname: surname,
            fullName: fullName
          });
        }
      }
    });
    
    if (newPlayers.length > 0) {
      setPlayers([...players, ...newPlayers]);
      setTextInput('');
    }
  };

  const addPlayer = () => {
    setPlayers([...players, {
      id: Date.now(),
      number: '',
      surname: 'SURNAME',
      fullName: 'Player Name'
    }]);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
    if (selectedPlayer?.id === id) setSelectedPlayer(null);
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        if (field === 'fullName') {
          const surname = value.trim().toUpperCase();
          return { ...p, fullName: value, surname: surname };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const drawMagnet = (player) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const scale = window.devicePixelRatio || 2;
    canvas.width = magnetWidth * scale;
    canvas.height = magnetHeight * scale;
    canvas.style.width = magnetWidth + 'px';
    canvas.style.height = magnetHeight + 'px';
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (useGradient) {
      let gradient;
      if (gradientDirection === 'horizontal') {
        gradient = ctx.createLinearGradient(0, 0, magnetWidth, 0);
      } else if (gradientDirection === 'vertical') {
        gradient = ctx.createLinearGradient(0, 0, 0, magnetHeight);
      } else if (gradientDirection === 'diagonal') {
        gradient = ctx.createLinearGradient(0, 0, magnetWidth, magnetHeight);
      }
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, magnetWidth, magnetHeight);
    } else if (baseImage) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseImage, 0, 0, magnetWidth, magnetHeight);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, magnetWidth, magnetHeight);
    }

    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, magnetWidth - borderWidth, magnetHeight - borderWidth);
    }

    const centerY = magnetHeight / 2;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${numberSize}px ${customFont || 'Arial'}`;
    ctx.textAlign = 'left';
    ctx.fillText(player.number, numberX, centerY);

    const numberWidth = ctx.measureText(player.number).width;
    const numberRightEdge = numberX + numberWidth;
    
    ctx.font = `bold ${nameSize}px ${customFont || 'Arial'}`;
    
    const gapBeforeDiamond = 15;
    const gapAfterDiamond = 15;
    
    const diamondCenterX = numberRightEdge + gapBeforeDiamond + (diamondWidth / 2);
    const diamondCenterY = centerY;
    
    ctx.save();
    ctx.fillStyle = diamondColor;
    ctx.beginPath();
    ctx.moveTo(diamondCenterX, diamondCenterY - diamondHeight/2);
    ctx.lineTo(diamondCenterX + diamondWidth/2, diamondCenterY);
    ctx.lineTo(diamondCenterX, diamondCenterY + diamondHeight/2);
    ctx.lineTo(diamondCenterX - diamondWidth/2, diamondCenterY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const diamondRightEdge = diamondCenterX + (diamondWidth / 2);
    const nameStartX = diamondRightEdge + gapAfterDiamond;

    ctx.font = `bold ${nameSize}px ${customFont || 'Arial'}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.surname, nameStartX, centerY);

    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if (selectedPlayer) {
      drawMagnet(selectedPlayer);
    }
  }, [selectedPlayer, baseImage, customFont, magnetWidth, magnetHeight, numberSize, nameSize, textColor, borderColor, borderWidth, numberX, diamondWidth, diamondHeight, diamondColor, useGradient, gradientStart, gradientEnd, gradientDirection]);

  const exportSingleMagnet = () => {
    if (!selectedPlayer) {
      alert('Please select a player to export');
      return;
    }
    const dataUrl = drawMagnet(selectedPlayer);
    const link = document.createElement('a');
    link.download = `${selectedPlayer.number}_${selectedPlayer.surname}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportAllMagnets = () => {
    if (players.length === 0) {
      alert('No players to export');
      return;
    }

    players.forEach((player, index) => {
      setTimeout(() => {
        const dataUrl = drawMagnet(player);
        const link = document.createElement('a');
        link.download = `${player.number}_${player.surname}.png`;
        link.href = dataUrl;
        link.click();
      }, index * 200);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">AFL Magnet Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload size={20} />
                Background
              </h2>
              
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">AFL Team Preset</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => handleTeamSelect(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  {Object.keys(aflTeams).map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-700">Use Gradient Background</span>
                </label>
              </div>

              {!useGradient && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Or upload base image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type size={20} />
                Upload Custom Font
              </h2>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add Players</h2>
              
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-medium text-blue-900 mb-1">Import from Footywire:</p>
                <ol className="text-blue-800 space-y-1 ml-4 list-decimal text-xs">
                  <li>Go to team page</li>
                  <li>Select & copy player table</li>
                  <li>Paste below</li>
                </ol>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste here...&#10;&#10;23	Jack Smith&#10;14	Taylor Adams"
                className="w-full h-32 p-3 border rounded-lg text-sm mb-3 font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={parsePlayerList}
                  disabled={!textInput.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  Add from List
                </button>
                <button
                  onClick={addPlayer}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Players ({players.length})</h2>
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`mb-3 p-3 border rounded-lg cursor-pointer transition ${selectedPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={player.number}
                        onChange={(e) => updatePlayer(player.id, 'number', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="No."
                        className="text-sm p-1 border rounded"
                      />
                      <input
                        type="text"
                        value={player.fullName}
                        onChange={(e) => updatePlayer(player.id, 'fullName', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Name"
                        className="text-sm p-1 border rounded"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePlayer(player.id);
                      }}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">→ {player.number} ◆ {player.surname}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Preview {selectedPlayer ? `- #${selectedPlayer.number} ${selectedPlayer.surname}` : ''}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportSingleMagnet}
                    disabled={!selectedPlayer}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
                  >
                    <Download size={18} />
                    Export This
                  </button>
                  <button
                    onClick={exportAllMagnets}
                    disabled={players.length === 0}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
                  >
                    <Download size={18} />
                    Export All ({players.length})
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-auto bg-gray-100 p-4">
                {selectedPlayer ? (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full border border-gray-300 shadow-lg"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    Select a player to preview
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Customize Layout</h2>
              
              {useGradient && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Gradient Settings</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Start Color</label>
                      <input
                        type="color"
                        value={gradientStart}
                        onChange={(e) => {
                          setGradientStart(e.target.value);
                          setSelectedTeam('Custom');
                        }}
                        className="w-full p-1 border rounded h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">End Color</label>
                      <input
                        type="color"
                        value={gradientEnd}
                        onChange={(e) => {
                          setGradientEnd(e.target.value);
                          setSelectedTeam('Custom');
                        }}
                        className="w-full p-1 border rounded h-10"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-700 block mb-1">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                        <option value="diagonal">Diagonal</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Magnet Width</label>
                  <input
                    type="number"
                    value={magnetWidth}
                    onChange={(e) => setMagnetWidth(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Magnet Height</label>
                  <input
                    type="number"
                    value={magnetHeight}
                    onChange={(e) => setMagnetHeight(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Number Size</label>
                  <input
                    type="number"
                    value={numberSize}
                    onChange={(e) => setNumberSize(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Name Size</label>
                  <input
                    type="number"
                    value={nameSize}
                    onChange={(e) => setNameSize(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Number X Position</label>
                  <input
                    type="number"
                    value={numberX}
                    onChange={(e) => setNumberX(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Diamond Width</label>
                  <input
                    type="number"
                    value={diamondWidth}
                    onChange={(e) => setDiamondWidth(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Diamond Height</label>
                  <input
                    type="number"
                    value={diamondHeight}
                    onChange={(e) => setDiamondHeight(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Diamond Color</label>
                  <input
                    type="color"
                    value={diamondColor}
                    onChange={(e) => setDiamondColor(e.target.value)}
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Border Color</label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Border Width</label>
                  <input
                    type="number"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
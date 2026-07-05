import React, { useEffect, useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { supabase } from '../supabaseClient';
import './Tree.css'; // We'll create this for tooltip styles

const StyledNode = ({ node }) => {
  if (!node) return null;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px', position: 'relative' }}>
      
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--white)',
        backgroundColor: 'var(--primary-blue)',
        padding: '3px 12px',
        borderRadius: '12px',
        marginBottom: '10px',
        fontWeight: 'bold',
        zIndex: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        Đời {node.gen}
      </div>
      
      <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
        
        {/* Primary Member */}
        <div className="tree-node-wrapper" style={{
          padding: '12px 20px',
          borderRadius: '8px',
          border: '2px solid var(--primary-blue)',
          backgroundColor: 'var(--white)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          minWidth: '140px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Tooltip Hover */}
          <div className="node-tooltip">
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{node.name}</div>
            <div style={{ fontSize: '0.85rem' }}>
              <div><strong>Sinh năm:</strong> {node.dob || 'Chưa cập nhật'}</div>
              <div><strong>Học vấn:</strong> {node.education || 'Chưa cập nhật'}</div>
              <div><strong>Chức vụ:</strong> {node.title || 'Chưa cập nhật'}</div>
              <div><strong>Công việc:</strong> {node.job || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div style={{ fontWeight: '700', color: 'var(--dark-blue)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            {node.name}
          </div>
        </div>
        
        {/* Spouse */}
        {node.spouse && (
          <>
            <div style={{ height: '3px', width: '25px', backgroundColor: 'var(--accent-green)' }}></div>
            <div className="tree-node-wrapper" style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '2px solid var(--accent-green)',
              backgroundColor: '#fdfbf9',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              minWidth: '140px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Tooltip Hover for Spouse */}
              <div className="node-tooltip" style={{ borderColor: 'var(--accent-green)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px', color: 'var(--accent-green)' }}>{node.spouse}</div>
                <div style={{ fontSize: '0.85rem' }}>
                  <div><strong>Sinh năm:</strong> {node.spouse_dob || 'Chưa cập nhật'}</div>
                  <div><strong>Học vấn:</strong> {node.spouse_education || 'Chưa cập nhật'}</div>
                  <div><strong>Chức vụ:</strong> {node.spouse_title || 'Chưa cập nhật'}</div>
                  <div><strong>Công việc:</strong> {node.spouse_job || 'Chưa cập nhật'}</div>
                </div>
              </div>

              <div style={{ fontWeight: '600', color: 'var(--accent-green)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                {node.spouse}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Vợ/Chồng</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Recursive rendering function
const renderTreeNodes = (nodes) => {
  if (!nodes || nodes.length === 0) return null;
  return nodes.map(node => (
    <TreeNode key={node.id} label={<StyledNode node={node} />}>
      {node.children && renderTreeNodes(node.children)}
    </TreeNode>
  ));
};

// Helper to find nodes by generation
const getNodesByGen = (rootNode, genToFind) => {
  if (!rootNode) return [];
  let results = [];
  const traverse = (node) => {
    if (node.gen === genToFind) {
      results.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(rootNode);
  return results;
};

function FamilyTree() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedGen, setSelectedGen] = useState('');
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [availablePeople, setAvailablePeople] = useState([]);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*');
    if (error) {
      console.error('Lỗi tải dữ liệu gia phả:', error);
      setLoading(false);
      return;
    }
    
    // Build tree
    const nodeMap = {};
    data.forEach(item => {
      nodeMap[item.id] = { ...item, children: [] };
    });

    let root = null;
    data.forEach(item => {
      if (item.parent_id) {
        if (nodeMap[item.parent_id]) {
          nodeMap[item.parent_id].children.push(nodeMap[item.id]);
        }
      } else {
        root = nodeMap[item.id]; // found root
      }
    });

    setTreeData(root);
    setSelectedRoot(root);
    setLoading(false);
  };

  const handleGenChange = (e) => {
    const gen = parseInt(e.target.value);
    setSelectedGen(gen);
    if (!isNaN(gen) && treeData) {
      const people = getNodesByGen(treeData, gen);
      setAvailablePeople(people);
      setViewMode('list');
      setSelectedRoot(null);
    } else {
      setAvailablePeople([]);
      setViewMode('tree');
      setSelectedRoot(treeData);
    }
  };

  const handlePersonSelect = (person) => {
    setSelectedRoot(person);
    setViewMode('tree');
  };

  const handleReset = () => {
    setSelectedGen('');
    setAvailablePeople([]);
    setSelectedRoot(treeData);
    setViewMode('tree');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Đang tải dữ liệu gia phả...</div>;
  }

  return (
    <div style={{ 
      position: 'absolute', top: '72px', left: 0, right: 0, bottom: 0, 
      backgroundColor: 'var(--bg-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' 
    }}>
      {/* Control Panel */}
      <div style={{ 
        position: 'absolute', top: '15px', left: '15px', zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.95)', padding: '10px 15px',
        borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        maxWidth: '280px', display: 'flex', flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.2rem', color: 'var(--dark-blue)' }}>Sơ Đồ Gia Tộc</h2>
        
        <div style={{ marginBottom: '5px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Bộ lọc (Filter):</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={selectedGen} 
              onChange={handleGenChange}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1, fontSize: '0.85rem' }}
            >
              <option value="">-- Toàn bộ gia tộc --</option>
              {[...Array(11)].map((_, i) => (
                <option key={i+5} value={i+5}>Đời {i+5}</option>
              ))}
            </select>
            <button 
              onClick={handleReset}
              style={{ padding: '6px 12px', backgroundColor: 'var(--secondary-blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Reset
            </button>
          </div>
        </div>

        {viewMode === 'tree' && selectedRoot && treeData && selectedRoot.id !== treeData.id && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#eef6ff', borderRadius: '6px', border: '1px solid #cce0ff' }}>
            <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '5px' }}>Đang hiển thị sơ đồ nhánh của:</div>
            <div style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>{selectedRoot.name} (Đời {selectedRoot.gen})</div>
            <button 
              onClick={() => { setViewMode('list'); setSelectedRoot(null); }}
              style={{ marginTop: '8px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
            >
              &larr; Quay lại danh sách Đời {selectedGen}
            </button>
          </div>
        )}

        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0, fontStyle: 'italic' }}>
          Mẹo: Di chuột vào tên để xem thông tin chi tiết. Kéo/thả để di chuyển sơ đồ.
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, width: '100%', height: '100%', cursor: viewMode === 'tree' ? 'grab' : 'default' }}>
        
        {viewMode === 'list' && (
          <div style={{ padding: '100px 50px 50px', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center', color: 'var(--dark-blue)', marginBottom: '30px', fontSize: '1.8rem' }}>
              Danh sách thành viên Đời thứ {selectedGen} ({availablePeople.length} người)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              {availablePeople.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handlePersonSelect(p)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    borderTop: '4px solid var(--primary-blue)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Đời {p.gen}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--dark-blue)', marginBottom: '10px' }}>{p.name}</div>
                  {p.spouse && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: 'var(--accent-green)' }}>♥</span> {p.spouse}
                    </div>
                  )}
                  {p.education && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>Học vấn: {p.education}</div>
                  )}
                  {p.title && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>Chức vụ: {p.title}</div>
                  )}
                  <div style={{ marginTop: '15px', color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center' }}>
                    Xem sơ đồ nhánh &rarr;
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'tree' && selectedRoot && (
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={3}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <>
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
                  <button className="btn" onClick={() => zoomIn()}>+</button>
                  <button className="btn" onClick={() => zoomOut()}>-</button>
                  <button className="btn btn-secondary" onClick={() => resetTransform()}>Reset Zoom</button>
                </div>
                
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                  <div style={{ padding: '100px' }}>
                    <Tree
                      lineWidth={'2px'}
                      lineColor={'var(--primary-blue)'}
                      lineBorderRadius={'10px'}
                      label={<StyledNode node={selectedRoot} />}
                    >
                      {selectedRoot.children && renderTreeNodes(selectedRoot.children)}
                    </Tree>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}

export default FamilyTree;

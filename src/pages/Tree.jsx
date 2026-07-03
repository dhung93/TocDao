import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { familyData } from './data';

const StyledNode = ({ node }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
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
      <div style={{
        padding: '12px 20px',
        borderRadius: '8px',
        border: '2px solid var(--primary-blue)',
        backgroundColor: 'var(--white)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        minWidth: '140px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontWeight: '700', color: 'var(--dark-blue)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
          {node.name}
        </div>
      </div>
      
      {/* Spouse */}
      {node.spouse && (
        <>
          {/* Connector Line */}
          <div style={{ height: '3px', width: '25px', backgroundColor: 'var(--accent-green)' }}></div>
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: '2px solid var(--accent-green)',
            backgroundColor: '#fdfbf9',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            minWidth: '140px',
            textAlign: 'center',
            position: 'relative'
          }}>
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

// Recursive rendering function
const renderTreeNodes = (nodes) => {
  if (!nodes) return null;
  return nodes.map(node => (
    <TreeNode key={node.id} label={<StyledNode node={node} />}>
      {node.children && renderTreeNodes(node.children)}
    </TreeNode>
  ));
};

function FamilyTree() {
  return (
    <div style={{ 
      position: 'absolute', 
      top: '72px', /* Height of navbar approx */
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'var(--bg-color)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Sơ Đồ Gia Tộc</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', maxWidth: '300px' }}>
          Dùng chuột (hoặc ngón tay) để kéo/thả và cuộn chuột để phóng to/thu nhỏ sơ đồ. Nhánh Đời 11-15 nằm bên tay trái.
        </p>
      </div>

      <div style={{ flex: 1, width: '100%', height: '100%', cursor: 'grab' }}>
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
                <button className="btn btn-secondary" onClick={() => resetTransform()}>Reset</button>
              </div>
              
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div style={{ padding: '100px' }}>
                  <Tree
                    lineWidth={'2px'}
                    lineColor={'var(--primary-blue)'}
                    lineBorderRadius={'10px'}
                    label={<StyledNode node={familyData} />}
                  >
                    {familyData.children && renderTreeNodes(familyData.children)}
                  </Tree>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}

export default FamilyTree;

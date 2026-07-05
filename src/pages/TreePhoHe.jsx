import React, { useEffect, useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { supabase } from '../supabaseClient';
import './TreePhoHe.css';

const StyledNode = ({ node, hasChildren, isCollapsed, onToggle }) => {
  if (!node) return null;
  
  return (
    <div className="phohe-node-container">
      {/* Node Box */}
      <div className="phohe-node-box">
        {/* Tooltip Hover */}
        <div className="phohe-tooltip">
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{node.name}</div>
          <div style={{ fontSize: '0.85rem', textAlign: 'left' }}>
            <div><strong>Sinh năm:</strong> {node.dob || 'Chưa cập nhật'}</div>
            <div><strong>Học vấn:</strong> {node.education || 'Chưa cập nhật'}</div>
            <div><strong>Chức vụ:</strong> {node.title || 'Chưa cập nhật'}</div>
            <div><strong>Công việc:</strong> {node.job || 'Chưa cập nhật'}</div>
            {node.spouse && (
              <div style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #ccc' }}>
                <strong style={{ color: 'var(--accent-green)' }}>Vợ/Chồng: {node.spouse}</strong>
                <div>Sinh năm: {node.spouse_dob || 'Chưa cập nhật'}</div>
                <div>Công việc: {node.spouse_job || 'Chưa cập nhật'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="phohe-name">{node.name}</div>
        {node.spouse && (
          <div className="phohe-spouse">{node.spouse}</div>
        )}

        {/* Toggle Button */}
        {hasChildren && (
          <div 
            className="phohe-toggle-btn" 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            title={isCollapsed ? "Mở rộng nhánh" : "Thu gọn nhánh"}
          >
            {isCollapsed ? '+' : '-'}
          </div>
        )}
      </div>
    </div>
  );
};

const renderTreeNodes = (nodes, collapsedNodes, toggleNode) => {
  if (!nodes || nodes.length === 0) return null;
  return nodes.map(node => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <TreeNode 
        key={node.id} 
        label={
          <StyledNode 
            node={node} 
            hasChildren={hasChildren} 
            isCollapsed={isCollapsed} 
            onToggle={() => toggleNode(node.id)} 
          />
        }
      >
        {!isCollapsed && hasChildren && renderTreeNodes(node.children, collapsedNodes, toggleNode)}
      </TreeNode>
    );
  });
};

function TreePhoHe() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

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
        root = nodeMap[item.id];
      }
    });

    // Mặc định: Mở rộng tất cả các nhánh
    setCollapsedNodes(new Set());
    setTreeData(root);
    setLoading(false);
  };

  const toggleNode = (nodeId) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedNodes(new Set());
  };

  const collapseAll = () => {
    if (!treeData) return;
    const allIds = new Set();
    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        allIds.add(node.id);
        node.children.forEach(traverse);
      }
    };
    traverse(treeData);
    // Không gấp gốc, giữ lại đời 1 hiển thị
    allIds.delete(treeData.id);
    setCollapsedNodes(allIds);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Đang tải dữ liệu phổ hệ...</div>;
  }

  // Find max generation to draw the left column
  let maxGen = 1;
  const findMaxGen = (node) => {
    if (node.gen > maxGen) maxGen = node.gen;
    if (node.children) {
      node.children.forEach(findMaxGen);
    }
  };
  if (treeData) findMaxGen(treeData);

  const generations = Array.from({ length: maxGen }, (_, i) => i + 1);

  return (
    <div className="phohe-wrapper">
      <div className="phohe-title-banner">
        <h2>SƠ ĐỒ PHỔ HỆ TỘC ĐÀO</h2>
      </div>

      <TransformWrapper
        initialScale={0.8}
        minScale={0.1}
        maxScale={2}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="phohe-controls">
              <button onClick={expandAll}>Mở rộng tất cả</button>
              <button onClick={collapseAll}>Thu gọn tất cả</button>
              <button onClick={() => zoomIn()}>Phóng to (+)</button>
              <button onClick={() => zoomOut()}>Thu nhỏ (-)</button>
              <button onClick={() => resetTransform()}>Mặc định</button>
            </div>

            <TransformComponent wrapperClass="phohe-transform-wrapper" contentClass="phohe-transform-content">
              
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Generation Labels Column */}
                <div className="phohe-gen-column">
                  {generations.map(gen => (
                    <div key={gen} className="phohe-gen-label">ĐỜI {gen}</div>
                  ))}
                </div>

                {/* The Tree */}
                <div className="phohe-tree-container">
                  <Tree
                    lineWidth={'1px'}
                    lineColor={'#333'}
                    lineBorderRadius={'0px'} // Square lines
                    lineHeight={'60px'}
                    nodePadding={'0px'}
                    label={
                      <StyledNode 
                        node={treeData} 
                        hasChildren={treeData && treeData.children && treeData.children.length > 0} 
                        isCollapsed={treeData && collapsedNodes.has(treeData.id)}
                        onToggle={() => treeData && toggleNode(treeData.id)}
                      />
                    }
                  >
                    {treeData && treeData.children && !collapsedNodes.has(treeData.id) && renderTreeNodes(treeData.children, collapsedNodes, toggleNode)}
                  </Tree>
                </div>
              </div>

            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default TreePhoHe;

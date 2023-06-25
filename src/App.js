import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [coordinatorInfo, setCoordinatorInfo] = useState({});
  const [nodes, setNodes] = useState([]);
  const [nodeShards, setNodeShards] = useState({});


  useEffect(() => {

    fetchNodes()
      .then((data) => setNodes(data))
      .catch((error) => console.error('Failed to fetch nodes:', error));

    const storedCoordinatorInfo = localStorage.getItem('coordinatorInfo');
    if (storedCoordinatorInfo) {
      setCoordinatorInfo(JSON.parse(storedCoordinatorInfo));
    } else {
      fetchCoordinatorInfo()
        .then((data) => {
          setCoordinatorInfo(data);
          localStorage.setItem('coordinatorInfo', JSON.stringify(data));
        })
        .catch((error) => console.error('Failed to fetch coordinator info:', error));
    }


    fetchNodeShards()
      .then((data) => setNodeShards(data))
      .catch((error) => console.error('Failed to fetch node shards:', error));
  }, []);

  const handleShardSplitStart = () => {
    console.log('citus_auto_shard_split_start clicked');

    fetch('http://localhost:8080/api/StartSplitShard')
      .catch((error) => console.error('Failed to start shard split:', error));
  };

  const handleRebalanceStart = () => {
    console.log('citus_rebalance_start clicked');

    fetch('http://localhost:8080/api/StartRebalance')
      .catch((error) => console.error('Failed to start rebalance:', error));
  };


  const fetchCoordinatorInfo = () => {
    return new Promise((resolve) => {   
      setTimeout(() => {
        const coordinatorNode = nodes.find((node) => node.NodePort === 9700);
        const coordinatorData = {
          id: coordinatorNode ? coordinatorNode.NodeID : '',
          name: coordinatorNode ? coordinatorNode.NodeName : '',
          port: coordinatorNode ? coordinatorNode.NodePort : '',
        };

        resolve(coordinatorData);
      }, 1000);
    });
  };

  const fetchNodes = () => {
    return fetch('http://localhost:8080/api/nodes') 
      .then((response) => response.json())
      .catch((error) => {
        console.error('Failed to fetch nodes:', error);
        return [];
      });
  };


  const fetchNodeShards = () => {
    return fetch('http://localhost:8080/api/nodeshards') 
      .then((response) => response.json())
      .catch((error) => {
        console.error('Failed to fetch node shards:', error);
        return {};
      });
  };

  return (
    <div className="app-container">
      <div className="coordinator-info">
        <h1>Coordinator Info</h1>
        <table className="info-table">
          <tbody>
            <tr>
              <td><strong>ID:</strong></td>
              <td>{coordinatorInfo.id}</td>
            </tr>
            <tr>
              <td><strong>Name:</strong></td>
              <td>{coordinatorInfo.name}</td>
            </tr>
            <tr>
              <td><strong>Port:</strong></td>
              <td>{coordinatorInfo.port}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="connected-nodes">
        <h1>Connected Nodes</h1>
        <div className="node-container">
          {nodes.map((node) => (
            <div key={node.NodeId} className="node-box">
              <div>
                <strong>ID:</strong> {node.NodeID}
              </div>
              <div>
                <strong>Name:</strong> {node.NodeName}
              </div>
              <div>
                <strong>Port:</strong> {node.NodePort}
              </div>
              <table className="node-table">
                <thead>
                  <tr>
                    <th>Shard ID</th>
                    <th>Shard Size</th>
                  </tr>
                </thead>
                <tbody>
                  {nodeShards[node.NodeID]
                  ?.sort((a, b) => b.Shardsize - a.Shardsize)
                  .map((shard) => (
                    <tr key={shard.ShardId}>
                      <td>{shard.ShardId}</td>
                      <td>{shard.Shardsize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="button-container">
        <button onClick={handleShardSplitStart}>citus_auto_shard_split_start</button>
        <button onClick={handleRebalanceStart}>citus_rebalance_start</button>
      </div>
    </div>
  );
}

export default App;


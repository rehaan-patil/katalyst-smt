"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomTopologyNode, NodeData } from "./CustomTopologyNode";
import { CriticalCutEdge } from "@/lib/types";

const nodeTypes = {
  customNode: CustomTopologyNode,
};

interface TopologyCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  criticalCutEdges: CriticalCutEdge[];
  vulnerableNodeIds: string[];
  sourceNodeId: string;
  sinkNodeId: string;
}

export function TopologyCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  criticalCutEdges,
  vulnerableNodeIds,
  sourceNodeId,
  sinkNodeId,
}: TopologyCanvasProps) {
  // Format nodes with visual metadata
  const decoratedNodes = useMemo(() => {
    const vulnSet = new Set(vulnerableNodeIds);
    return nodes.map((node) => {
      const data = node.data as unknown as NodeData;
      return {
        ...node,
        data: {
          ...data,
          isSource: node.id === sourceNodeId,
          isSink: node.id === sinkNodeId,
          isVulnerable: vulnSet.has(node.id),
        },
      };
    });
  }, [nodes, vulnerableNodeIds, sourceNodeId, sinkNodeId]);

  // Format edges with highlighting
  const decoratedEdges = useMemo(() => {
    const cutEdgeSet = new Set(
      criticalCutEdges.map((e) => `${e.source}->${e.target}`)
    );

    return edges.map((edge) => {
      const isCut = cutEdgeSet.has(`${edge.source}->${edge.target}`);
      const isRepair = edge.id?.startsWith("repair-");

      return {
        ...edge,
        animated: isCut || isRepair,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isCut ? "#EF4444" : isRepair ? "#8B5CF6" : "#60A5FA",
        },
        style: {
          stroke: isCut ? "#EF4444" : isRepair ? "#8B5CF6" : "#404040",
          strokeWidth: isCut ? 3 : isRepair ? 2.5 : 1.5,
          strokeDasharray: isRepair ? "5 5" : undefined,
        },
      };
    });
  }, [edges, criticalCutEdges]);

  return (
    <div className="w-full h-full bg-black relative">
      <ReactFlow
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background color="#222222" gap={20} size={1} />
        <Controls className="!bg-panel !border-white/10" />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === sourceNodeId) return "#10B981";
            if (n.id === sinkNodeId) return "#06B6D4";
            if (vulnerableNodeIds.includes(n.id)) return "#EF4444";
            return "#404040";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-panel !border-white/10 rounded-md"
        />
      </ReactFlow>
    </div>
  );
}

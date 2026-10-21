"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
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

  // Format edges with clean highlighting
  const decoratedEdges = useMemo(() => {
    const cutEdgeSet = new Set(
      criticalCutEdges.map((e) => `${e.source}->${e.target}`)
    );

    return edges.map((edge) => {
      const isCut = cutEdgeSet.has(`${edge.source}->${edge.target}`);
      const isRepair = edge.id?.startsWith("repair-");

      const edgeColor = isCut
        ? "#E11D48" // Rose-600 for bottlenecks
        : isRepair
        ? "#2563EB" // Blue-600 for synthesized repair link
        : "#94A3B8"; // Slate-400 for standard link

      return {
        ...edge,
        animated: isCut || isRepair,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: edgeColor,
        },
        style: {
          stroke: edgeColor,
          strokeWidth: isCut ? 2.5 : isRepair ? 2.2 : 1.5,
          strokeDasharray: isRepair ? "4 4" : undefined,
        },
      };
    });
  }, [edges, criticalCutEdges]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden select-none">
      <ReactFlow
        nodes={decoratedNodes}
        edges={decoratedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background color="#CBD5E1" gap={24} size={1.2} />
        <Controls className="!bg-white !border !border-slate-200 !text-slate-700 !rounded-xl !shadow-md" />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === sourceNodeId) return "#2563EB";
            if (n.id === sinkNodeId) return "#059669";
            if (vulnerableNodeIds.includes(n.id)) return "#E11D48";
            return "#CBD5E1";
          }}
          maskColor="rgba(241, 245, 249, 0.75)"
          className="!bg-white !border !border-slate-200 !rounded-xl !shadow-md"
        />
      </ReactFlow>
    </div>
  );
}

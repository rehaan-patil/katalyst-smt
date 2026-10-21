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

  // Format edges with enterprise highlighting
  const decoratedEdges = useMemo(() => {
    const cutEdgeSet = new Set(
      criticalCutEdges.map((e) => `${e.source}->${e.target}`)
    );

    return edges.map((edge) => {
      const isCut = cutEdgeSet.has(`${edge.source}->${edge.target}`);
      const isRepair = edge.id?.startsWith("repair-");

      const edgeColor = isCut
        ? "#F43F5E" // Rose-500 for critical cut bottlenecks
        : isRepair
        ? "#818CF8" // Brand indigo for synthesized repair
        : "#334155"; // Slate-700 for nominal pipeline

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
          strokeWidth: isCut ? 2.75 : isRepair ? 2.25 : 1.5,
          strokeDasharray: isRepair ? "4 4" : undefined,
          filter: isCut ? "drop-shadow(0 0 4px rgba(244,63,94,0.4))" : undefined,
        },
      };
    });
  }, [edges, criticalCutEdges]);

  return (
    <div className="w-full h-full bg-[#07090E] relative overflow-hidden select-none">
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
        <Background color="#1e293b" gap={24} size={1.25} />
        <Controls className="!bg-slate-900/90 !border !border-slate-800 !text-slate-300 !rounded-lg !shadow-xl !shadow-black/70" />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === sourceNodeId) return "#10B981";
            if (n.id === sinkNodeId) return "#06B6D4";
            if (vulnerableNodeIds.includes(n.id)) return "#F43F5E";
            return "#334155";
          }}
          maskColor="rgba(7, 9, 14, 0.75)"
          className="!bg-slate-950/90 !border !border-slate-800 !rounded-lg !shadow-xl !shadow-black/70"
        />
      </ReactFlow>
    </div>
  );
}

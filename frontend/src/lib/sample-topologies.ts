import { Topology } from "./types";

export interface TopologyPreset {
  id: string;
  name: string;
  description: string;
  difficulty: "Vulnerable (k=1)" | "Vulnerable (k=2)" | "Resilient (k=1)" | "Resilient (k=2)" | "Cyclic" | "Custom";
  topology: Topology;
}

export const SAMPLE_TOPOLOGIES: TopologyPreset[] = [
  {
    id: "cloud-ecommerce",
    name: "Cloud E-Commerce Microservices",
    description: "Multi-tier microservices with an intermediate articulation bottleneck in the order aggregator.",
    difficulty: "Vulnerable (k=1)",
    topology: {
      source_node_id: "ingress-gw",
      sink_node_id: "aurora-db",
      nodes: [
        { id: "ingress-gw", label: "Envoy Ingress", tier: "ingress", failure_prob: 0.002 },
        { id: "auth-service", label: "Auth Proxy", tier: "service", failure_prob: 0.015 },
        { id: "cart-service", label: "Cart Service", tier: "service", failure_prob: 0.02 },
        { id: "order-aggregator", label: "Order Aggregator", tier: "service", failure_prob: 0.01 },
        { id: "payment-gw", label: "Payment Svc", tier: "service", failure_prob: 0.008 },
        { id: "inventory-svc", label: "Inventory Svc", tier: "service", failure_prob: 0.012 },
        { id: "aurora-db", label: "Aurora Primary", tier: "db", failure_prob: 0.001 },
      ],
      edges: [
        { source: "ingress-gw", target: "auth-service", capacity: 50.0, spectral_weight: 2.0 },
        { source: "ingress-gw", target: "cart-service", capacity: 40.0, spectral_weight: 1.5 },
        { source: "auth-service", target: "order-aggregator", capacity: 35.0, spectral_weight: 1.5 },
        { source: "cart-service", target: "order-aggregator", capacity: 30.0, spectral_weight: 1.2 },
        { source: "order-aggregator", target: "payment-gw", capacity: 45.0, spectral_weight: 2.0 },
        { source: "order-aggregator", target: "inventory-svc", capacity: 40.0, spectral_weight: 1.8 },
        { source: "payment-gw", target: "aurora-db", capacity: 30.0, spectral_weight: 2.5 },
        { source: "inventory-svc", target: "aurora-db", capacity: 35.0, spectral_weight: 2.5 },
      ],
    },
  },
  {
    id: "dual-path-resilient",
    name: "Dual-Path High-Resilience Mesh",
    description: "Fully partitioned active-active multi-zone architecture with zero single points of failure.",
    difficulty: "Resilient (k=1)",
    topology: {
      source_node_id: "global-dns",
      sink_node_id: "cockroach-sql",
      nodes: [
        { id: "global-dns", label: "Route 53 DNS", tier: "ingress", failure_prob: 0.001 },
        { id: "zone-a-api", label: "Zone-A API", tier: "service", failure_prob: 0.01 },
        { id: "zone-b-api", label: "Zone-B API", tier: "service", failure_prob: 0.01 },
        { id: "zone-a-worker", label: "Zone-A Worker", tier: "service", failure_prob: 0.015 },
        { id: "zone-b-worker", label: "Zone-B Worker", tier: "service", failure_prob: 0.015 },
        { id: "cockroach-sql", label: "CockroachDB", tier: "db", failure_prob: 0.0005 },
      ],
      edges: [
        { source: "global-dns", target: "zone-a-api", capacity: 60.0, spectral_weight: 2.0 },
        { source: "global-dns", target: "zone-b-api", capacity: 60.0, spectral_weight: 2.0 },
        { source: "zone-a-api", target: "zone-a-worker", capacity: 45.0, spectral_weight: 1.5 },
        { source: "zone-b-api", target: "zone-b-worker", capacity: 45.0, spectral_weight: 1.5 },
        { source: "zone-a-api", target: "zone-b-worker", capacity: 30.0, spectral_weight: 1.0 },
        { source: "zone-b-api", target: "zone-a-worker", capacity: 30.0, spectral_weight: 1.0 },
        { source: "zone-a-worker", target: "cockroach-sql", capacity: 50.0, spectral_weight: 2.5 },
        { source: "zone-b-worker", target: "cockroach-sql", capacity: 50.0, spectral_weight: 2.5 },
      ],
    },
  },
  {
    id: "cyclic-mesh",
    name: "Cyclic Reconciliation Mesh",
    description: "Contains mutual feedback cycles between reconciliation workers and queue brokers.",
    difficulty: "Cyclic",
    topology: {
      source_node_id: "webhook-rx",
      sink_node_id: "event-store",
      nodes: [
        { id: "webhook-rx", label: "Webhook Receiver", tier: "ingress", failure_prob: 0.005 },
        { id: "reconciler-a", label: "Reconciler Pod A", tier: "service", failure_prob: 0.02 },
        { id: "reconciler-b", label: "Reconciler Pod B", tier: "service", failure_prob: 0.02 },
        { id: "kafka-broker", label: "Kafka Broker", tier: "service", failure_prob: 0.01 },
        { id: "event-store", label: "Event Store S3", tier: "db", failure_prob: 0.001 },
      ],
      edges: [
        { source: "webhook-rx", target: "reconciler-a", capacity: 30.0, spectral_weight: 1.5 },
        { source: "reconciler-a", target: "reconciler-b", capacity: 25.0, spectral_weight: 2.0 },
        { source: "reconciler-b", target: "reconciler-a", capacity: 25.0, spectral_weight: 2.0 },
        { source: "reconciler-b", target: "kafka-broker", capacity: 35.0, spectral_weight: 1.8 },
        { source: "kafka-broker", target: "event-store", capacity: 50.0, spectral_weight: 2.0 },
      ],
    },
  },
];

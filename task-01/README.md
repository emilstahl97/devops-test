# Task 01: Kubernetes Environment Setup

## Purpose

This task focuses on setting up a local Kubernetes development environment using [KIND](https://kind.sigs.k8s.io/) (Kubernetes IN Docker). Creating a proper local Kubernetes environment is a useful skill for DevOps engineers and serves as the foundation for the tasks that follow.

## Instructions

Set up a local k8s cluster using [KIND](https://kind.sigs.k8s.io/).

You will be using this cluster to solve the tasks ahead.

## Configure KIND with Local Registry

1. Create a local registry:

```sh
docker run -d --restart=always -p "127.0.0.1:5001:5000" --name "kind-registry" registry:2
```

2. Create the cluster with the configuration in this folder:

```sh
kind create cluster --config kind-config.yaml
```

3. Connect the registry to the KIND network:

```sh
docker network connect "kind" kind-registry
```

Verify the cluster is working with:

```sh
kind get clusters
# OUTPUT:
# kind
```

```sh
kubectl cluster-info --context kind-kind
# OUTPUT:
# Kubernetes control plane is running at URL_ADDRESS:PORT
# CoreDNS is running at URL_ADDRESS:PORT

```

```sh
kubectl get nodes
# OUTPUT:
# NAME                 STATUS   ROLES           AGE   VERSION
# kind-control-plane   Ready    control-plane   10s   v1.3X.Y
```

```sh
kubectl get pods -A
# OUTPUT:
# NAMESPACE            NAME                                         READY   STATUS    RESTARTS   AGE
# kube-system          coredns-668d6bf9bc-gfm6x                     1/1     Running   0          15s
# kube-system          coredns-668d6bf9bc-kcngf                     1/1     Running   0          15s
# kube-system          etcd-kind-control-plane                      1/1     Running   0          23s
# kube-system          kindnet-478bk                                1/1     Running   0          16s
# kube-system          kube-apiserver-kind-control-plane            1/1     Running   0          23s
# kube-system          kube-controller-manager-kind-control-plane   1/1     Running   0          23s
# kube-system          kube-proxy-sjjc7                             1/1     Running   0          16s
# kube-system          kube-scheduler-kind-control-plane            1/1     Running   0          23s
# local-path-storage   local-path-provisioner-7dc846544d-cjgzr      1/1     Running   0          15s
```

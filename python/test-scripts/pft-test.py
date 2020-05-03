import sys
import json
import math
import numpy as np
from pathlib import Path
from sklearn.svm import LinearSVC
from sklearn.cluster import KMeans, estimate_bandwidth
from scipy.spatial import distance
from statistics import mode


# blues = ['leather', 'fish', 'apple', 'computer', 'japan']
# reds = ['italy', 'orange', 'river', 'silk']
# blacks = ['ocean']

# blues = ['ocean', 'river', 'apple', 'bridge', 'nose']
# reds = ['italy', 'computer', 'silk', 'fish']
# blacks = ['ocean']

blues = ['apple', 'orange', 'fruit','lemon']
reds = ['italy', 'computer', 'silk', 'fish']
blacks = ['ocean']


def readEmbeddings(path, embeddings={}):
    f = open(path);

    for line in f:
        values = line.split()
        word = values[0]
        vectors = np.asarray(values[1:], "float32")
        if word in embeddings:
            embeddings[word].append(vectors)
        else:
            embeddings[word] = [vectors]

    f.close()
    return embeddings

path = "/Users/johnnanmonzon/Documents/codenames/python/word-embeddings/"
pft_vectors = ["pft-1.txt", "pft-2.txt"]

embeddings = {}
for i in range(len(pft_vectors)):
    embeddings = readEmbeddings(path + pft_vectors[i], embeddings)

#this section clusters the blue words to find words close enough together to make a hint for
cluster_data = []
cluster_words = []


for word in blues:
    for i in range(2):
        cluster_words.append(word)
        cluster_data.append(embeddings[word][i])

for i in range(len(blues) * 2):
    clusters = KMeans(n_clusters=i + 1).fit(cluster_data)
    tightness = clusters.inertia_ * 10000
    if tightness < 100 :
        break

targetWords = []
mode = mode(clusters.labels_)

for i in range(len(clusters.labels_)):
    label = clusters.labels_[i]
    word = cluster_words[i]
    if label == mode and word not in targetWords:
        targetWords.append(word)

data = []
labels = []

for word in targetWords:
    for i in range(2):
        data.append(embeddings[word][i])
        labels.append("good")

for word in reds + blacks:
    for i in range(2):
        data.append(embeddings[word][i])
        labels.append("bad")

model = LinearSVC(class_weight="balanced")
model.fit(data,labels)

def goodness(w):
    for word in blues:
        if w in word or word in w:
            return 0
    a = model.decision_function(embeddings[w][0].reshape(1,-1))
    b = model.decision_function(embeddings[w][1].reshape(1,-1))
    return max(a,b)

best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w))
hint = best[0]

# def cosine(w1,w2):
#     shortestDistance = 1.0
#     for i in range(2):
#         for j in range(2):
#             dist = distance.cosine(embeddings[w1][i], embeddings[w2][j])
#             if dist < shortestDistance:
#                 shortestDistance = dist
#     return round(shortestDistance,3)
#
# sorted_blues = {}
# for i in range(len(blues)):
#     blue = blues[i]
#     sorted_blues[blue] = cosine(blue,hint)
#
# sorted_blues = sorted(sorted_blues.items(), key=lambda b: b[1])
# targetWords = [sorted_blues[0][0]]
#
# for i in range(1, len(sorted_blues)):
#     if sorted_blues[i][1] < 0.5:
#         targetWords.append(sorted_blues[i][0])

results = json.dumps({
    "hint": hint,
    "count" : len(targetWords),
    "targetWords" : str(targetWords),
    "top10" : best[:10],
    "worst10" : best[-9:],
    "blues" : str(blues),
    "clusters" : str(clusters.labels_)
}, indent=2)

print(results)

# sys.stdout.flush()

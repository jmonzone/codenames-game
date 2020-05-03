import sys
import json
import math
import numpy as np
from pathlib import Path
from sklearn.svm import LinearSVC
from sklearn.cluster import KMeans
from scipy.spatial import distance
from statistics import mode

input = json.loads(sys.argv[1])
blues = input['blues']
reds = input['reds']
blacks = input['blacks']
vectorPath = "word-embeddings/" + input['vectorPath']

def readEmbeddings(path, embeddings={}):
    f = open(Path(__file__).parent.parent / path);

    for line in f:
        values = line.split()
        word = values[0]
        vectors = np.asarray(values[1:], "float32")
        embeddings[word] = (vectors)

    f.close()
    return embeddings

embeddings = readEmbeddings(vectorPath)

#this section clusters the blue words to find words close enough together to make a hint for
cluster_data = []
cluster_words = []

for word in blues:
    cluster_words.append(word)
    cluster_data.append(embeddings[word])

for i in range(len(blues)):
    clusters = KMeans(n_clusters=i + 1).fit(cluster_data)
    if clusters.inertia_ < 20:
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
    data.append(embeddings[word])
    labels.append("good")

for word in reds + blacks:
    data.append(embeddings[word])
    labels.append("bad")

model = LinearSVC(class_weight="balanced")
model.fit(data,labels)

def goodness(w):
    for word in blues:
        if w in word or word in w:
            return 0
    return model.decision_function(embeddings[w].reshape(1,-1))

best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w))
hint = best[0]

results = json.dumps({
    "hint": hint,
    "count" : len(targetWords),
    "targetWords" : str(targetWords),
    "top5" : best[:5],
    "worst5" : best[-4:],
    "clusters" : str(cluster_words) + " " +  str(clusters.labels_),
    "inertia" : str(clusters.inertia_)

}, indent=2)

print(results)

sys.stdout.flush()

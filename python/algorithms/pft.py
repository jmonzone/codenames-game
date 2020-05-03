import sys
import json
import math
import numpy as np
from pathlib import Path
from sklearn.svm import LinearSVC
from sklearn.cluster import KMeans, estimate_bandwidth
from scipy.spatial import distance
from statistics import mode

input = json.loads(sys.argv[1])
blues = input['blues']
reds = input['reds']
blacks = input['blacks']

def readEmbeddings(path, embeddings={}):
    f = open(Path(__file__).parent.parent / path);

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

path = "word-embeddings/"
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

# cluster_count is being used as a naive measure to find out how many clusters there shoudl be
cluster_count = math.ceil(len(blues) * estimate_bandwidth(cluster_data) * 10)
clusters = KMeans(n_clusters=cluster_count).fit(cluster_data)

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

results = json.dumps({
    "hint": hint,
    "count" : len(targetWords),
    "targetWords" : str(targetWords),
    "top5" : best[:5],
    "worst5" : best[-4:]

}, indent=2)

print(results)


sys.stdout.flush()

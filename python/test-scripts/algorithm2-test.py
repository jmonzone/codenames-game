import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path

f = open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/word-embeddings/glove-embeddings.txt");

blues = ['river','sea','ocean', 'video']
reds = ['breakfast','lady','silk']
blacks = ['husband']
words = blues + reds + blacks
blackWeight = 2.0
redWeight = 1.0
blueWeight = 4.0
maxCosDistance = 0.5
minTargetWords = 2

embeddings = {}
for line in f:
    values = line.split()
    word = values[0]
    vectors = np.asarray(values[1:], "float32")
    embeddings[word] = vectors

def distance(word, reference):
    return spatial.distance.cosine(embeddings[word], embeddings[reference])

def goodness(word, blues, reds, blacks):
    blueDist = blueWeight * sum([distance(word, blue) for blue in blues]) / len(blues)
    redDist = redWeight * sum([distance(word, red) for red in reds]) / len(reds)
    blackDist = blackWeight * sum([distance(word, black) for black in blacks]) / len(blacks)
    return blackDist + redDist - blueDist

def candidates(blues, reds, blacks):
    best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, blues, reds, blacks))
    return best

def isValidHint(hint, words):
    for word in words:
        if hint in word or word in hint:
            return False
    return True

average = 1
averages = []
ignoredWords = []
distances = {}

while average > maxCosDistance and len(blues) > minTargetWords:
    toIgnore = blues[0]

    for word in blues:
        distances[word] = sum([distance(word, b) for b in blues]) / (len(blues) - 1)
        if distances[word] > distances[toIgnore]:
            toIgnore = word

    average = sum(distances.values()) / len(distances.keys())
    averages.append(average)

    if average > maxCosDistance:
        blues.remove(toIgnore)
        ignoredWords.append(toIgnore)


for candidate in candidates(blues, reds, blacks):
    if isValidHint(candidate, words):
        hint = candidate
        break;

results = json.dumps({
    "hint": hint,
    "count": len(blues),
    "targetWords": blues,
    "ignoredWords": ignoredWords,
    "distances": distances,
})

print(results)

# hintFound = False
#
# ignoredWords = []
#
# while not hintFound:
#
#     hintFound = True
#
#     for h in candidates(blues, reds, blacks):
#         if isValidHint(h, words):
#             hint = h
#             break;
#
#     for word in blues:
#         dist = distance(hint, word)
#         distances[word] = dist
#         if dist > maxDistance:
#             ignoredWords.append(word)
#             blues.remove(word)
#             hintFound = False
#             break;
#
# results = json.dumps({
#     "hint": hint,
#     "count": len(blues),
#     "targetWords": blues,
#     "ignoredWords": ignoredWords,
#     "distances": distances,
# })
#
# print(results)

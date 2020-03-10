import sys
import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path
from itertools import combinations

blues = ['apple','computer','japan','glasses','bag','fish','italy','dictionary','book', 'leather',
'husband','breakfast','lady','silk','festival','spirit','medicine','bike','plastic','stone',
'flower','tissue','nail','video','beach','ship','face','body','head','key']
reds = ['wind','bridge','nose','car','bath','ghost','ring','slide','hockey','wine',
'root','mouth','board','vitamin','air','ear','eye','sea','pie','cell']
blacks = ['ocean']
words = blues + reds + blacks
blueWeight = 10
redWeight = 1
blackWeight = 2
maxCosDistance = 0.5
minTargetWords = 2
maxTargetWords = 3
vectorPath = "word-embeddings/word2vec-embeddings.txt"

f = open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/word-embeddings/word2vec-embeddings.txt");

embeddings = {}
for line in f:
    values = line.split()
    word = values[0]
    vectors = np.asarray(values[1:], "float32")
    embeddings[word] = vectors

def distance(word, reference):
    return spatial.distance.cosine(embeddings[word], embeddings[reference])

def goodness(word, blues, reds, blacks):
    blueDist = blueWeight * sum([distance(word, blue) for blue in blues])
    redDist = redWeight * sum([distance(word, red) for red in reds])
    blackDist = blackWeight * sum([distance(word, black) for black in blacks])
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
targetWordCombs = {}

while average > maxCosDistance and len(blues) > minTargetWords:
    toIgnore = blues[0]

    distances = {}

    for word in blues:
        distances[word] = sum([distance(word, b) for b in blues]) / (len(blues) - 1)
        if distances[word] > distances[toIgnore]:
            toIgnore = word

    average = sum(distances.values()) / len(distances.keys())
    averages.append(average)
    targetWordCombs[str(blues)] = average

    if average > maxCosDistance:
        blues.remove(toIgnore)
        ignoredWords.append(toIgnore)

if len(blues) == minTargetWords and len(blues) > 1:
    for word in blues:
        distances[word] = sum([distance(word, b) for b in blues]) / (len(blues) - 1)
    average = sum(distances.values()) / len(distances.keys())
    averages.append(average)

candidates = candidates(blues, reds, blacks)

hints = {}
for candidate in candidates:
    if isValidHint(candidate, words):
        hints[candidate] = sum([distance(word, candidate) for word in blues]) / len(blues)
    if len(hints) > 10:
        break

hint = list(hints.keys())[0]

results = json.dumps({
    "hint": hint,
    "count": len(blues),
    "targetWords": str(blues),
    "ignoredWords": str(ignoredWords),
    "top10Hints": hints,
    "otherTargetWordCombos": targetWordCombs,
})

print(results)

sys.stdout.flush()

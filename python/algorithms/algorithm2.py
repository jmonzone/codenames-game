import sys
import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path

input = json.loads(sys.argv[1])
blues = input['blues']
reds = input['reds']
blacks = input['blacks']
words = blues + reds + blacks
blueWeight = input['blueWeight']
redWeight = input['redWeight']
blackWeight = input['blackWeight']
maxCosDistance = input['maxCosDistance']
minTargetWords = input['minTargetWords']
vectorPath = "word-embeddings/" + input['vectorPath']

f = open(Path(__file__).parent.parent / vectorPath);

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

while average > maxCosDistance and len(blues) > minTargetWords:
    toIgnore = blues[0]

    distances = {}

    for word in blues:
        distances[word] = sum([distance(word, b) for b in blues]) / (len(blues) - 1)
        if distances[word] > distances[toIgnore]:
            toIgnore = word

    average = sum(distances.values()) / len(distances.keys())
    averages.append(average)

    if average > maxCosDistance:
        blues.remove(toIgnore)
        ignoredWords.append(toIgnore)

if len(blues) == minTargetWords and len(blues) > 1:
    for word in blues:
        distances[word] = sum([distance(word, b) for b in blues]) / (len(blues) - 1)
    average = sum(distances.values()) / len(distances.keys())
    averages.append(average)

for candidate in candidates(blues, reds, blacks):
    if isValidHint(candidate, words):
        hint = candidate
        break;

distanceFromHint = {}
for word in blues + ignoredWords:
    distanceFromHint[word] = distance(word, hint)

results = json.dumps({
    "hint": hint,
    "count": len(blues),
    "targetWords": blues,
    "ignoredWords": ignoredWords,
    "distancesFromHint": distanceFromHint,
    "averages": averages,
})

print(results)

sys.stdout.flush()

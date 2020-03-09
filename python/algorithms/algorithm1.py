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
maxDistance = input['maxCosDistance']
blueWeight = input['blueWeight']
redWeight = input['redWeight']
blackWeight = input['blackWeight']
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


hintFound = False

ignoredWords = []
distances = {}

while not hintFound:

    hintFound = True

    for h in candidates(blues, reds, blacks):
        if isValidHint(h, words):
            hint = h
            break;

    for word in blues:
        dist = distance(hint, word)
        distances[word] = dist
        if dist > maxDistance:
            ignoredWords.append(word)
            blues.remove(word)
            hintFound = False
            break;

results = json.dumps({
    "hint": hint,
    "count": len(blues),
    "targetWords": blues,
    "ignoredWords": ignoredWords,
    "distances": distances,
})

print(results)

sys.stdout.flush()

# # def goodness(word, answers, bad):
# #     return sum([distance(word, b) for b in bad]) - 4.0 * sum([distance(word, a) for a in answers])
# #
# # def minimax(word, answers, bad):
# #     return min([distance(word, b) for b in bad]) - max([distance(word, a) for a in answers])
# #
# # def candidates(answers, bad, size=1):
# #     best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, answers, bad))
# #     res = [(str(i + 1), "{0:.2f}".format(minimax(w, answers, bad)), w) for i, w in enumerate(sorted(best[:250], key=lambda w: -1 * minimax(w, answers, bad))[:size])]
# #     candidates = [(c[2]) for c in res]
# #     return candidates[0]

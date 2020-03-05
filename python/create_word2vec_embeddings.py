import gensim
import csv

model = gensim.models.KeyedVectors.load_word2vec_format('/Users/anthonyastarita/ml/thesis/GoogleNews-vectors-negative300.bin', binary=True, limit=500000)


with open('top5000.csv', newline='') as f:
    reader = csv.reader(f)
    data = list(reader)

data = [str(w).replace('\\xa0', '') for w in data]
data = [str(w).replace("['", '') for w in data]
data = [str(w).replace("']", '') for w in data]

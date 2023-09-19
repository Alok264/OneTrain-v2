if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()

import nltk
# nltk.download('punkt')
import numpy as np

def tokenization(string):
    words = nltk.word_tokenize(string)
    return words

def stopWordRemoval(Words):
    stopWords = nltk.corpus.stopwords.words('english')
    wordWithoutStopWords = [word for word in Words if word not in stopWords]
    return wordWithoutStopWords

def stemming(word):
    stemmer = nltk.stem.PorterStemmer()
    stemWord = stemmer.stem(word.lower())
    return stemWord

def stemminglist(words):
    stemmer = nltk.stem.PorterStemmer()
    stemWord = [stemmer.stem(word.lower()) for word in words]
    return stemWord


def excludePunctuation(words):
    wordWithoutpunctuation = [word for word in words if word.isalpha()]
    return wordWithoutpunctuation

def bag_of_words(tokenized_sentence, all_words):
    tokenized_sentence = stemminglist(tokenized_sentence)
    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bag[idx] = 1.0

    return bag

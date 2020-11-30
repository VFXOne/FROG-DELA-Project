import itertools

trick_1 = [2,6,10,14,18,22,1,5,9,13,17,21]
trick_2 = [4,8,12,16,20,24,3,7,11,15,19,23]

t1 = list(map(lambda x : str(x),trick_1))
t2 = list(map(lambda x : str(x),trick_2))
perm = list(map(','.join, itertools.chain(itertools.product(t1, t2), itertools.product(t2, t1))))

print(perm)

print(';'.join(perm))
for p in perm :
    print(p)
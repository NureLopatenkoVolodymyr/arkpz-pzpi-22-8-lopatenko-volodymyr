-- Робоча програма на Haskell, що демонструє правила оформлення коду
-- 
-- Рекомендація 1: Використовуйте осмислені назви функцій та змінних
-- Поганий приклад
f :: Int -> Int
f x = x + 1

-- Гарний приклад
incrementNumber :: Int -> Int
incrementNumber number = number + 1

-- Рекомендація 2: Розбивайте складні функції на підфункції
-- Поганий приклад
processDataBad :: [Int] -> [Int]
processDataBad lst = map (\x -> x * 2 + 3) (filter (> 0) lst)

-- Гарний приклад
filterPositive :: [Int] -> [Int]
filterPositive lst = filter (> 0) lst

transform :: Int -> Int
transform x = x * 2 + 3

processData :: [Int] -> [Int]
processData lst = map transform (filterPositive lst)

-- Рекомендація 3: Дотримуйтеся стилю вирівнювання коду
-- Поганий приклад
mainBad :: IO ()
mainBad = do putStrLn "Enter your name"
name <- getLine
putStrLn ("Hello, " ++ name)

-- Гарний приклад
main :: IO ()
main = do
    putStrLn "Enter your name"
    name <- getLine
    putStrLn ("Hello, " ++ name)

-- Рекомендація 4: Використовуйте стандартні бібліотеки
-- Поганий приклад
reverseList :: [a] -> [a]
reverseList [] = []
reverseList (x:xs) = reverseList xs ++ [x]

-- Гарний приклад
import Data.List (reverse)

mainReverse :: IO ()
mainReverse = print (reverse [1, 2, 3, 4])

-- Рекомендація 5: Уникайте дублювання коду
-- Поганий приклад
calculateAreaCircle :: Double -> Double
calculateAreaCircle r = pi * r^2

calculateAreaSquare :: Double -> Double
calculateAreaSquare s = s^2

-- Гарний приклад
data Shape = Circle Double | Square Double

calculateArea :: Shape -> Double
calculateArea shape = case shape of
    Circle r -> pi * r^2
    Square s -> s^2

-- Рекомендація 6: Дотримуйтеся принципів чистоти функцій
-- Поганий приклад
counter :: Int
counter = 0

incrementBad :: Int -> Int
incrementBad x = counter + x

-- Гарний приклад
increment :: Int -> Int
increment x = x + 1

-- Рекомендація 7: Використовуйте розгорнуті типи для кращого розуміння коду
-- Поганий приклад
areaBad r = pi * r^2

-- Гарний приклад
area :: Double -> Double
area radius = pi * radius^2

-- Рекомендація 8: Документуйте код
-- Поганий приклад
areaUndocumented r = pi * r^2

-- Гарний приклад
-- Обчислює площу круга за заданим радіусом
areaDocumented :: Double -> Double
areaDocumented radius = pi * radius^2

-- Основна програма, що використовує вищенаведені рекомендації
runProgram :: IO ()
runProgram = do
    putStrLn "Testing clean code examples"
    putStrLn "Increment number (garbage):"
    print (f 5) -- Використання поганого прикладу
    putStrLn "Increment number (clean):"
    print (incrementNumber 5) -- Використання гарного прикладу

    putStrLn "Process data (garbage):"
    print (processDataBad [-1, 2, -3, 4]) -- Використання поганого прикладу
    putStrLn "Process data (clean):"
    print (processData [-1, 2, -3, 4]) -- Використання гарного прикладу

    putStrLn "Reverse list (clean):"
    mainReverse -- Використання гарного прикладу

    putStrLn "Calculate areas (clean):"
    print (calculateArea (Circle 5)) -- Використання гарного прикладу
    print (calculateArea (Square 3)) -- Використання гарного прикладу

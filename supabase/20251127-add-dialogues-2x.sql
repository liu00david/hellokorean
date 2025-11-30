-- Dialogues for Lessons 2.0 - 2.3
-- These dialogues use ALL vocabulary from each lesson + previous lessons (cumulative)

-- ============================================
-- Lesson 2.0: Essential Greetings
-- ============================================
-- Vocabulary: 안녕하세요, 안녕히 가세요, 안녕히 계세요, 감사합니다, 죄송합니다, 네, 아니요

UPDATE lessons
SET dialogue = '{
  "title": "Meeting a Neighbor",
  "messages": [
    {
      "speaker": "지수",
      "korean": "안녕하세요!",
      "english": "Hello!",
      "romanization": "annyeonghaseyo!"
    },
    {
      "speaker": "민호",
      "korean": "아, 안녕하세요!",
      "english": "Oh, hello!",
      "romanization": "a, annyeonghaseyo!"
    },
    {
      "speaker": "지수",
      "korean": "죄송합니다. 이거 제 우산이에요?",
      "english": "I''m sorry. Is this my umbrella?",
      "romanization": "joesonghamnida. igeo je usanieyo?"
    },
    {
      "speaker": "민호",
      "korean": "아니요, 제 우산이에요.",
      "english": "No, it''s my umbrella.",
      "romanization": "aniyo, je usanieyo."
    },
    {
      "speaker": "지수",
      "korean": "아, 죄송합니다!",
      "english": "Oh, I''m sorry!",
      "romanization": "a, joesonghamnida!"
    },
    {
      "speaker": "민호",
      "korean": "괜찮아요. 네, 문제없어요.",
      "english": "It''s okay. Yes, no problem.",
      "romanization": "gwaenchanayo. ne, munjeeopseoyo."
    },
    {
      "speaker": "지수",
      "korean": "감사합니다. 안녕히 계세요!",
      "english": "Thank you. Goodbye! (I''m leaving)",
      "romanization": "gamsahamnida. annyeonghi gyeseyo!"
    },
    {
      "speaker": "민호",
      "korean": "네, 안녕히 가세요!",
      "english": "Yes, goodbye! (You''re leaving)",
      "romanization": "ne, annyeonghi gaseyo!"
    }
  ]
}'::jsonb
WHERE id = '2.0';

-- ============================================
-- Lesson 2.1: Self Introduction
-- ============================================
-- Vocabulary: All from 2.0 + 저, 이름, 이에요, 예요, 입니다, 만나서 반갑습니다, 미국

UPDATE lessons
SET dialogue = '{
  "title": "First Day at School",
  "messages": [
    {
      "speaker": "서연",
      "korean": "안녕하세요!",
      "english": "Hello!",
      "romanization": "annyeonghaseyo!"
    },
    {
      "speaker": "준호",
      "korean": "안녕하세요! 저는 준호예요. 이름이 뭐예요?",
      "english": "Hello! I''m Junho. What''s your name?",
      "romanization": "annyeonghaseyo! jeoneun junhoyeyo. ireumi mwoyeyo?"
    },
    {
      "speaker": "서연",
      "korean": "저는 서연이에요. 만나서 반갑습니다!",
      "english": "I''m Seoyeon. Nice to meet you!",
      "romanization": "jeoneun seoyeonieyo. mannaseo bangapseumnida!"
    },
    {
      "speaker": "준호",
      "korean": "네, 만나서 반갑습니다. 미국 사람이에요?",
      "english": "Yes, nice to meet you. Are you American?",
      "romanization": "ne, mannaseo bangapseumnida. miguk saramieyo?"
    },
    {
      "speaker": "서연",
      "korean": "아니요, 저는 한국 사람이에요. 준호 씨는요?",
      "english": "No, I''m Korean. What about you, Junho?",
      "romanization": "aniyo, jeoneun hanguk saramieyo. junho ssineunyo?"
    },
    {
      "speaker": "준호",
      "korean": "저는 미국 사람입니다.",
      "english": "I am American.",
      "romanization": "jeoneun miguk saramimnida."
    },
    {
      "speaker": "서연",
      "korean": "아, 네! 감사합니다. 안녕히 가세요!",
      "english": "Oh, yes! Thank you. Goodbye!",
      "romanization": "a, ne! gamsahamnida. annyeonghi gaseyo!"
    },
    {
      "speaker": "준호",
      "korean": "네, 안녕히 계세요!",
      "english": "Yes, goodbye!",
      "romanization": "ne, annyeonghi gyeseyo!"
    }
  ]
}'::jsonb
WHERE id = '2.1';

-- ============================================
-- Lesson 2.2: Friendly Checks & Small Talk
-- ============================================
-- Vocabulary: All from 2.0, 2.1 + 잘 지내요?, 네 잘 지내요, 그럭저럭이에요, 오랜만이에요, 처음 뵙겠습니다, 좋은 아침이에요, 좋은 하루 보내세요, 잘 부탁드립니다

UPDATE lessons
SET dialogue = '{
  "title": "Catching Up with a Friend",
  "messages": [
    {
      "speaker": "지수",
      "korean": "안녕하세요! 오랜만이에요!",
      "english": "Hello! Long time no see!",
      "romanization": "annyeonghaseyo! oraenmanieyo!"
    },
    {
      "speaker": "민호",
      "korean": "아, 지수 씨! 네, 정말 오랜만이에요. 잘 지내요?",
      "english": "Oh, Jisu! Yes, it''s been so long. How are you?",
      "romanization": "a, jisu ssi! ne, jeongmal oraenmanieyo. jal jinaeyo?"
    },
    {
      "speaker": "지수",
      "korean": "네, 잘 지내요. 민호 씨는요?",
      "english": "Yes, I''m doing well. How about you, Minho?",
      "romanization": "ne, jal jinaeyo. minho ssineunyo?"
    },
    {
      "speaker": "민호",
      "korean": "저는 그럭저럭이에요. 요즘 바빠요.",
      "english": "I''m so-so. I''m busy these days.",
      "romanization": "jeoneun geureokjeoreogieyo. yojeum bappayo."
    },
    {
      "speaker": "지수",
      "korean": "아, 그래요? 아, 이쪽은 서연 씨예요.",
      "english": "Oh, really? Ah, this is Seoyeon.",
      "romanization": "a, geuraeyo? a, ijjogeun seoyeon ssiyeyo."
    },
    {
      "speaker": "서연",
      "korean": "안녕하세요! 저는 서연입니다. 처음 뵙겠습니다. 잘 부탁드립니다!",
      "english": "Hello! I''m Seoyeon. Nice to meet you. Please take care of me!",
      "romanization": "annyeonghaseyo! jeoneun seoyeonimnida. cheoeum boepgetseumnida. jal butakdeurimnida!"
    },
    {
      "speaker": "민호",
      "korean": "네, 만나서 반갑습니다. 저는 민호예요.",
      "english": "Yes, nice to meet you. I''m Minho.",
      "romanization": "ne, mannaseo bangapseumnida. jeoneun minhoyeyo."
    },
    {
      "speaker": "지수",
      "korean": "좋은 아침이에요! 커피 마실까요?",
      "english": "Good morning! Shall we get coffee?",
      "romanization": "joeun achimieyo! keopi masilkkayo?"
    },
    {
      "speaker": "민호",
      "korean": "네, 좋아요! 감사합니다!",
      "english": "Yes, sounds good! Thank you!",
      "romanization": "ne, joayo! gamsahamnida!"
    },
    {
      "speaker": "서연",
      "korean": "그럼 나중에 만나요. 좋은 하루 보내세요!",
      "english": "Then see you later. Have a good day!",
      "romanization": "geureom najunge mannayo. joeun haru bonaeseyo!"
    },
    {
      "speaker": "지수",
      "korean": "네, 안녕히 가세요!",
      "english": "Yes, goodbye!",
      "romanization": "ne, annyeonghi gaseyo!"
    }
  ]
}'::jsonb
WHERE id = '2.2';

-- ============================================
-- Lesson 2.3: Getting Attention & Simple Requests
-- ============================================
-- Vocabulary: All from 2.0, 2.1, 2.2 + 저기요, 잠시만요, 실례합니다, 이거 주세요, 도와주세요, 천천히 말해 주세요, 다시 말해 주세요, 이해 못 했어요, 괜찮아요

UPDATE lessons
SET dialogue = '{
  "title": "At the Cafe",
  "messages": [
    {
      "speaker": "준호",
      "korean": "저기요! 여기요!",
      "english": "Excuse me! Over here!",
      "romanization": "jeogiyo! yeogiyo!"
    },
    {
      "speaker": "수진",
      "korean": "네, 안녕하세요! 잠시만요. 지금 가요!",
      "english": "Yes, hello! Just a moment. I''m coming now!",
      "romanization": "ne, annyeonghaseyo! jamsimanyo. jigeum gayo!"
    },
    {
      "speaker": "준호",
      "korean": "네, 괜찮아요. 천천히 오세요.",
      "english": "Yes, it''s okay. Take your time.",
      "romanization": "ne, gwaenchanayo. cheoncheonhi oseyo."
    },
    {
      "speaker": "수진",
      "korean": "감사합니다! 주문하시겠어요?",
      "english": "Thank you! Would you like to order?",
      "romanization": "gamsahamnida! jumunhasigesseoyo?"
    },
    {
      "speaker": "준호",
      "korean": "네. 이거 주세요. 아메리카노요.",
      "english": "Yes. Please give me this. An americano.",
      "romanization": "ne. igeo juseyo. amerikanoyo."
    },
    {
      "speaker": "수진",
      "korean": "네, 아메리카노 하나요. 이름이 뭐예요?",
      "english": "Yes, one americano. What''s your name?",
      "romanization": "ne, amerikano hanayo. ireumi mwoyeyo?"
    },
    {
      "speaker": "준호",
      "korean": "죄송합니다. 이해 못 했어요. 천천히 말해 주세요.",
      "english": "I''m sorry. I didn''t understand. Please speak slowly.",
      "romanization": "joesonghamnida. ihae mot haesseoyo. cheoncheonhi malhae juseyo."
    },
    {
      "speaker": "수진",
      "korean": "네, 알겠습니다. 이... 름... 이... 뭐... 예요?",
      "english": "Yes, I understand. What... is... your... name?",
      "romanization": "ne, algesseumnida. i... reum... i... mwo... yeyo?"
    },
    {
      "speaker": "준호",
      "korean": "아! 저는 준호예요.",
      "english": "Ah! I''m Junho.",
      "romanization": "a! jeoneun junhoyeyo."
    },
    {
      "speaker": "수진",
      "korean": "네, 감사합니다! 준호 씨, 잠시만요!",
      "english": "Yes, thank you! Junho, just a moment!",
      "romanization": "ne, gamsahamnida! junho ssi, jamsimanyo!"
    },
    {
      "speaker": "준호",
      "korean": "실례합니다. 도와주세요. 물티슈 있어요?",
      "english": "Excuse me. Please help me. Do you have wet wipes?",
      "romanization": "sillyehamnida. dowajuseyo. multisyu isseoyo?"
    },
    {
      "speaker": "수진",
      "korean": "네, 여기요. 괜찮아요?",
      "english": "Yes, here you go. Are you okay?",
      "romanization": "ne, yeogiyo. gwaenchanayo?"
    },
    {
      "speaker": "준호",
      "korean": "네, 괜찮아요. 감사합니다!",
      "english": "Yes, I''m okay. Thank you!",
      "romanization": "ne, gwaenchanayo. gamsahamnida!"
    },
    {
      "speaker": "수진",
      "korean": "아니요, 좋은 하루 보내세요!",
      "english": "Not at all, have a good day!",
      "romanization": "aniyo, joeun haru bonaeseyo!"
    },
    {
      "speaker": "준호",
      "korean": "네, 안녕히 계세요!",
      "english": "Yes, goodbye!",
      "romanization": "ne, annyeonghi gyeseyo!"
    }
  ]
}'::jsonb
WHERE id = '2.3';

-- ============================================
-- Verify the dialogues were added
-- ============================================
SELECT
  id,
  title,
  dialogue->>'title' as dialogue_title,
  jsonb_array_length(dialogue->'messages') as message_count
FROM lessons
WHERE id IN ('2.0', '2.1', '2.2', '2.3')
ORDER BY order_index;

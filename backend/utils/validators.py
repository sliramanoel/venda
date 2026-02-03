"""
Validation utilities for phone numbers and emails
Prevents fake/spam submissions
"""
import re
from typing import Tuple

# List of known disposable email domains (can be expanded)
DISPOSABLE_EMAIL_DOMAINS = {
    '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
    'guerrillamail.com', 'guerrillamail.org', 'mailinator.com', 'mailinator.net',
    'throwaway.email', 'throwawaymail.com', 'fakeinbox.com', 'trashmail.com',
    'trashmail.net', 'mailnesia.com', 'tempail.com', 'dispostable.com',
    'sharklasers.com', 'spam4.me', 'maildrop.cc', 'getairmail.com',
    'getnada.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
    'mohmal.com', 'emailondeck.com', 'tempr.email', 'discard.email',
    'dropmail.me', 'mailcatch.com', 'mintemail.com', 'mytemp.email',
    'spamgourmet.com', 'harakirimail.com', 'mailexpire.com', 'tempinbox.com',
    'fake-box.com', 'fakemail.fr', 'tempmailaddress.com', 'emailfake.com',
    'emkei.cz', 'mailsac.com', 'inboxkitten.com', 'burnermail.io'
}

# Brazilian phone regex: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
BRAZIL_PHONE_REGEX = re.compile(r'^\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})$')

# Common fake phone patterns
FAKE_PHONE_PATTERNS = [
    r'^0{8,}$',  # All zeros
    r'^1{8,}$',  # All ones
    r'^(\d)\1{7,}$',  # Same digit repeated
    r'^12345',  # Sequential
    r'^11111',
    r'^00000',
    r'^99999',
]

# Valid DDD (area codes) in Brazil
VALID_DDD = {
    '11', '12', '13', '14', '15', '16', '17', '18', '19',  # SP
    '21', '22', '24',  # RJ
    '27', '28',  # ES
    '31', '32', '33', '34', '35', '37', '38',  # MG
    '41', '42', '43', '44', '45', '46',  # PR
    '47', '48', '49',  # SC
    '51', '53', '54', '55',  # RS
    '61',  # DF
    '62', '64',  # GO
    '63',  # TO
    '65', '66',  # MT
    '67',  # MS
    '68',  # AC
    '69',  # RO
    '71', '73', '74', '75', '77',  # BA
    '79',  # SE
    '81', '82', '83', '84', '85', '86', '87', '88', '89',  # NE
    '91', '92', '93', '94', '95', '96', '97', '98', '99',  # N
}


def validate_brazilian_phone(phone: str) -> Tuple[bool, str]:
    """
    Validate Brazilian phone number format and detect fake numbers.
    
    Args:
        phone: Phone number string
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Remove formatting
    clean_phone = re.sub(r'[^\d]', '', phone)
    
    # Check length (10 or 11 digits)
    if len(clean_phone) < 10 or len(clean_phone) > 11:
        return False, "Telefone deve ter 10 ou 11 dígitos"
    
    # Extract DDD
    ddd = clean_phone[:2]
    
    # Validate DDD
    if ddd not in VALID_DDD:
        return False, f"DDD {ddd} inválido"
    
    # Get the number part (without DDD)
    number_part = clean_phone[2:]
    
    # Mobile numbers (9 digits) must start with 9
    if len(number_part) == 9 and not number_part.startswith('9'):
        return False, "Celular deve começar com 9"
    
    # Landlines (8 digits) must start with 2-5
    if len(number_part) == 8 and number_part[0] not in '2345':
        return False, "Telefone fixo inválido"
    
    # Check for fake patterns
    for pattern in FAKE_PHONE_PATTERNS:
        if re.match(pattern, clean_phone):
            return False, "Número de telefone inválido"
    
    # Check for repeated digits (more than 5 same digits in a row)
    if re.search(r'(\d)\1{5,}', clean_phone):
        return False, "Número de telefone inválido"
    
    # Check for sequential patterns
    sequential_asc = '0123456789'
    sequential_desc = '9876543210'
    if any(seq in clean_phone for seq in [sequential_asc[i:i+6] for i in range(5)]):
        return False, "Número de telefone inválido"
    if any(seq in clean_phone for seq in [sequential_desc[i:i+6] for i in range(5)]):
        return False, "Número de telefone inválido"
    
    return True, ""


def validate_email(email: str) -> Tuple[bool, str]:
    """
    Validate email format and check for disposable/fake emails.
    
    Args:
        email: Email address string
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    email = email.lower().strip()
    
    # Basic format validation
    email_regex = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    if not email_regex.match(email):
        return False, "Formato de email inválido"
    
    # Extract domain
    domain = email.split('@')[1]
    
    # Check for disposable email domains
    if domain in DISPOSABLE_EMAIL_DOMAINS:
        return False, "Emails temporários não são permitidos"
    
    # Check for common fake patterns in local part
    local_part = email.split('@')[0]
    
    # Too short local part
    if len(local_part) < 3:
        return False, "Email muito curto"
    
    # All same characters
    if len(set(local_part.replace('.', ''))) <= 2:
        return False, "Email inválido"
    
    # Common test emails
    test_patterns = ['test', 'fake', 'example', 'asdf', 'qwerty', 'aaa', 'xxx', '123']
    if any(local_part == pattern or local_part.startswith(pattern + '@') for pattern in test_patterns):
        if domain not in ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com']:
            return False, "Email de teste não permitido"
    
    # Check for keyboard patterns
    keyboard_patterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx']
    if any(pattern in local_part for pattern in keyboard_patterns):
        return False, "Email inválido"
    
    return True, ""


def validate_name(name: str) -> Tuple[bool, str]:
    """
    Validate customer name.
    
    Args:
        name: Customer name string
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    name = name.strip()
    
    # Check minimum length
    if len(name) < 5:
        return False, "Nome muito curto"
    
    # Check for at least two words (first and last name)
    words = name.split()
    if len(words) < 2:
        return False, "Informe nome e sobrenome"
    
    # Each word should have at least 2 characters
    if any(len(word) < 2 for word in words):
        return False, "Nome inválido"
    
    # Check for only letters and spaces
    if not re.match(r'^[a-zA-ZÀ-ÿ\s]+$', name):
        return False, "Nome deve conter apenas letras"
    
    # Check for repeated characters (like "aaaa bbbb")
    for word in words:
        if len(set(word.lower())) == 1 and len(word) > 2:
            return False, "Nome inválido"
    
    # Check for keyboard patterns
    keyboard_patterns = ['asdf', 'qwer', 'zxcv']
    if any(pattern in name.lower() for pattern in keyboard_patterns):
        return False, "Nome inválido"
    
    return True, ""

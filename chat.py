#! python3
from prompt_toolkit import (
    
)
from prompt_toolkit.enums import (
    EditingMode,
)
sess = PromptSession("> ", editing_mode=EditingMode.VI)
sess.app.run()
